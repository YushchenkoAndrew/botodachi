import { HttpService } from "@nestjs/axios";
import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";
import { AxiosResponse } from "axios";
import md5 from "lib/md5";
import { lastValueFrom } from "rxjs";
import { PingApiDto } from "./dto/ping.dto";
import { TokenDto } from "./dto/token.dto";

@Injectable()
export class ApiService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private UpdateTokens(data: TokenDto) {
    this.cacheManager.set("API:Access", data.access_token, { ttl: 15 * 60 });
    this.cacheManager.set("API:Refresh", data.refresh_token, {
      ttl: 7 * 24 * 60 * 60,
    });
  }

  private DeleteTokens() {
    this.cacheManager.del("API:Access");
    this.cacheManager.del("API:Refresh");
  }

  private ApiAuth(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.cacheManager.get("API:Access").then((reply?: string) => {
        if (reply) return resolve(reply);

        // If Access token expired, then refresh token
        this.cacheManager.get("API:Refresh").then((reply?: string) => {
          if (reply) {
            lastValueFrom(
              this.httpService.post(
                `${process.env.API_URL}/refresh`,
                { refresh_token: reply },
                { headers: { "content-type": "application/json" } },
              ),
            )
              .then((res: AxiosResponse<TokenDto>) => {
                // If something wrong with keys or refresh token already
                // has been expired then just delete them and try again
                if (res.data.status === "ERR") {
                  this.DeleteTokens();
                  return this.ApiAuth()
                    .then((res) => resolve(res))
                    .catch((err) => reject(err));
                }

                this.UpdateTokens(res.data);
                resolve(res.data.access_token);
              })
              .catch((err) => reject(err));
          }

          // If Refresh token expired, then relogin
          const salt = md5((Math.random() * 10000 + 500).toString());
          lastValueFrom(
            this.httpService.post(
              `${process.env.API_URL}/login`,
              {
                user: process.env.API_USER,
                pass:
                  salt +
                  "$" +
                  md5(salt + process.env.API_PEPPER + process.env.API_PASS),
              },
              {
                headers: {
                  "X-Custom-Header": salt,
                  "content-type": "application/json",
                },
              },
            ),
          )
            .then((res: AxiosResponse<TokenDto>) => {
              if (res.data.status == "ERR")
                return reject("Incorrect user or pass");

              this.UpdateTokens(res.data);
              resolve(res.data.access_token);
            })
            .catch((err) => reject(err));
        });
      });
    });
  }

  ping(): Promise<string> {
    return new Promise((resolve) => {
      lastValueFrom(this.httpService.get(`${process.env.API_URL}/ping`))
        .then((res: AxiosResponse<PingApiDto>) => resolve(res.data.message))
        .catch(() => resolve("Unable to reach"));
    });
  }

  cacheRun(command: string): Promise<string> {
    return new Promise<string>((resolve) => {
      this.ApiAuth()
        .then((token) => {
          lastValueFrom(
            this.httpService.post(
              `${process.env.API_URL}/bot/redis`,
              { command },
              { headers: { Authorization: `Bear ${token}` } },
            ),
          )
            .then((res: AxiosResponse<any>) =>
              resolve(JSON.stringify(res.data, null, 2)),
            )
            .catch((err) => {
              resolve(
                JSON.stringify(
                  err?.response?.data || "{'message':'Error'}",
                  null,
                  2,
                ),
              );
            });
        })
        .catch((err) => {
          resolve(
            JSON.stringify(
              err?.response?.data || "{'message':'Error'}",
              null,
              2,
            ),
          );
        });
    });
  }
}
