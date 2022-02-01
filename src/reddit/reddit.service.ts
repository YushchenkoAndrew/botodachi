import { HttpService } from "@nestjs/axios";
import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { AxiosResponse } from "axios";
import { Cache } from "cache-manager";
import { lastValueFrom } from "rxjs";
import { RedditChildDto } from "./dto/reddit-child.dto";
import { RedditPostDto } from "./dto/reddit-post.dto";
import { TokenSuccessDto } from "./dto/token-success.dto";

@Injectable()
export class RedditService {
  private readonly URL = "https://www.reddit.com/api/v1";
  private readonly OAUTH_URL = "https://oauth.reddit.com/";

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private RedditAuth() {
    return new Promise<string>((resolve, reject) => {
      this.cacheManager.get("REDDIT:Access").then((reply?: string) => {
        if (reply) return resolve(reply);

        // If Refresh token expired, then relogin
        lastValueFrom(
          this.httpService.post(
            `${this.URL}/access_token`,
            "grant_type=client_credentials",
            {
              headers: {
                Authorization:
                  "Basic " +
                  Buffer.from(
                    process.env.REDDIT_ID + ":" + process.env.REDDIT_SECRET,
                  ).toString("base64"),
                "User-Agent": "botodachi/0.0.1",
                "Content-Type": "application/x-www-form-urlencoded",
              },
            },
          ),
        )
          .then((res: AxiosResponse<TokenSuccessDto>) => {
            this.cacheManager.set("REDDIT:Access", res.data.access_token, {
              ttl: res.data.expires_in,
            });
            resolve(res.data.access_token);
          })
          .catch((err) => reject(err));
      });
    });
  }

  getPostFromSubreddit(subreddit, type: string, limit: number = 30) {
    return new Promise<any>((resolve, reject) => {
      this.RedditAuth()
        .then((token) => {
          lastValueFrom(
            this.httpService.get(
              `${this.OAUTH_URL}/r/${subreddit}/${type}?limit=${limit}`,
              {
                headers: {
                  Authorization: `bearer ${token}`,
                  "User-Agent": "botodachi/0.0.1",
                  "Content-Type": "application/json",
                },
              },
            ),
          )
            .then((res: AxiosResponse<any>) => resolve(res.data))
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }
}
