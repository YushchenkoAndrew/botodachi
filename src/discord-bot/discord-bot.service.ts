import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { AxiosResponse } from "axios";
import { Message } from "discord.js";
import { lastValueFrom } from "rxjs";
import { DefaultRes, Ping as webPing } from "./interfaces/web.interface";
import { ApiTokens, Ping as apiPing } from "./interfaces/api.interface";
import md5 from "lib/md5";
import { DiscordClientProvider } from "discord-nestjs";

@Injectable()
export class DiscordBotService {
  private readonly webUrl = process.env.WEB_URL;
  private readonly webKey = process.env.WEB_KEY;
  private readonly webPepper = process.env.WEB_PEPPER;

  private readonly apiUrl = process.env.API_URL;
  private readonly apiUser = process.env.API_USER;
  private readonly apiPass = process.env.API_PASS;
  private readonly apiPepper = process.env.API_PEPPER;

  private readonly voidUrl = process.env.VOID_URL;

  private readonly logger = new Logger(DiscordBotService.name);

  constructor(
    private readonly discordProvider: DiscordClientProvider,
    private httpService: HttpService,
  ) {}

  Init() {
    this.logger.log(
      `Logged in as ${this.discordProvider.getClient().user.tag}!`,
    );
  }

  getCurrStatus(message: Message): void {
    message.channel.send("```yaml\nbotodachi: pong\n```");

    lastValueFrom(this.httpService.get(`${this.webUrl}/api/ping`))
      .then((res: AxiosResponse<webPing>) => {
        message.channel.send("```yaml\nweb: " + res.data.message + "\n```");
      })
      .catch(() => message.channel.send("```yaml\nweb: Unable to reach\n```"));

    lastValueFrom(this.httpService.get(`${this.apiUrl}/ping`))
      .then((res: AxiosResponse<apiPing>) => {
        message.channel.send("```yaml\napi: " + res.data.Message + "\n```");
      })
      .catch(() => message.channel.send("```yaml\napi: Unable to reach\n```"));

    lastValueFrom(this.httpService.head(this.voidUrl))
      .then((res: AxiosResponse) => {
        if (res.status === 200) {
          return message.channel.send("```yaml\nvoid: pong\n```");
        }
        message.channel.send("```yaml\nvoid: Unable to reach\n```");
      })
      .catch(() => message.channel.send("```yaml\nvoid: Unable to reach\n```"));
  }

  getCommands(message: Message): Promise<Message> {
    return message.channel.send(
      `Commands:
      \t● ping \t\t\t\t\t\t\t\t\t\t\t -- Pings all services
      \t● help \t\t\t\t\t\t\t\t\t\t\t -- Show help
      \t● cron run { HANDLER } \t\t\t-- Run one of botodachi cron task manually
      \t\t { HANDLER }:
      \t\t\t ○ cacheUpload \t\t\t\t\t -- Send local cache value to API
      \t\t\t ○ cacheReset \t\t\t\t\t\t-- Set to every cache variable 0
      \t\t\t ○ cacheClear \t\t\t\t\t\t -- Delete pre-cached values
      \t● web redis { COMMAND } \t  -- Exec command from Web Server Redis`,
    );
  }

  runCacheUpload(message: Message): Promise<Message> {
    const salt = md5((Math.random() * 10000 + 500).toString());
    return new Promise<Message>((resolve, rejects) => {
      lastValueFrom(
        this.httpService.post(
          `${this.webUrl}/api/cache/upload?key=${md5(
            salt + this.webPepper + this.webKey,
          )}`,
          "",
          { headers: { ["X-Custom-Header"]: salt } },
        ),
      )
        .then((res: AxiosResponse<DefaultRes>) => {
          message.channel
            .send("```json\n" + JSON.stringify(res.data, null, 2) + "\n```")
            .then((res) => resolve(res));
        })
        .catch((err) => {
          message.channel
            .send(
              "```json\n" +
                JSON.stringify(
                  err?.response?.data || "{'message':'Error'}",
                  null,
                  2,
                ) +
                "\n```",
            )
            .then((res) => resolve(res));
        });
    });
  }

  runCacheClear(message: Message): Promise<Message> {
    const salt = md5((Math.random() * 10000 + 500).toString());
    return new Promise<Message>((resolve, rejects) => {
      lastValueFrom(
        this.httpService.post(
          `${this.webUrl}/api/cache/clear?key=${md5(
            salt + this.webPepper + this.webKey,
          )}`,
          "",
          { headers: { ["X-Custom-Header"]: salt } },
        ),
      )
        .then((res: AxiosResponse) => {
          message.channel.send("Cleared!!!").then((res) => resolve(res));
        })
        .catch((err) => {
          message.channel
            .send(
              "```json\n" +
                JSON.stringify(
                  err?.response?.data || "{'message':'Error'}",
                  null,
                  2,
                ) +
                "\n```",
            )
            .then((res) => resolve(res));
        });
    });
  }

  runCacheReset(message: Message): Promise<Message> {
    const salt = md5((Math.random() * 10000 + 500).toString());
    return new Promise<Message>((resolve, rejects) => {
      lastValueFrom(
        this.httpService.post(
          `${this.webUrl}/api/cache/clear?key=${md5(
            salt + this.webPepper + this.webKey,
          )}`,
          "",
          { headers: { ["X-Custom-Header"]: salt } },
        ),
      )
        .then((res: AxiosResponse) => {
          message.channel.send("Values was reset").then((res) => resolve(res));
        })
        .catch((err) => {
          message.channel
            .send(
              "```json\n" +
                JSON.stringify(
                  err?.response?.data || "{'message':'Error'}",
                  null,
                  2,
                ) +
                "\n```",
            )
            .then((res) => resolve(res));
        });
    });
  }

  webRedis(command: string, message: Message): Promise<Message> {
    const salt = md5((Math.random() * 10000 + 500).toString());
    return new Promise<Message>((resolve, rejects) => {
      lastValueFrom(
        this.httpService.post(
          `${this.webUrl}/api/bot/redis?key=${md5(
            salt + this.webPepper + this.webKey,
          )}`,
          { command },
          { headers: { ["X-Custom-Header"]: salt } },
        ),
      )
        .then((res: AxiosResponse<DefaultRes>) => {
          message.channel
            .send("```json\n" + JSON.stringify(res.data, null, 2) + "\n```")
            .then((res) => resolve(res));
        })
        .catch((err) => {
          message.channel
            .send(
              "```json\n" +
                JSON.stringify(
                  err?.response?.data || "{'message':'Error'}",
                  null,
                  2,
                ) +
                "\n```",
            )
            .then((res) => resolve(res));
        });
    });
  }

  apiRedis(command: string, message: Message): Promise<Message> {
    const salt = md5((Math.random() * 10000 + 500).toString());
    return new Promise<Message>((resolve, rejects) => {
      lastValueFrom(
        this.httpService.post(
          `${this.apiUrl}/login`,
          {
            user: this.apiUser,
            pass: salt + "$" + md5(salt + this.apiPepper + this.apiPass),
          },
          { headers: { ["X-Custom-Header"]: salt } },
        ),
      )
        .then((res: AxiosResponse<ApiTokens>) => {
          if (res.data.status == "ERR") {
            return message.channel
              .send("```json\n" + JSON.stringify(res.data, null, 2) + "\n```")
              .then((res) => resolve(res));
          }

          lastValueFrom(
            this.httpService.post(
              `${this.apiUrl}/bot/redis`,
              { command },
              { headers: { Authorization: `Bear ${res.data.access_token}` } },
            ),
          )
            .then((res: AxiosResponse<any>) => {
              message.channel
                .send("```json\n" + JSON.stringify(res.data, null, 2) + "\n```")
                .then((res) => resolve(res));
            })
            .catch((err) => {
              message.channel
                .send(
                  "```json\n" +
                    JSON.stringify(
                      err?.response?.data || "{'message':'Error'}",
                      null,
                      2,
                    ) +
                    "\n```",
                )
                .then((res) => resolve(res));
            });
        })
        .catch((err) => {
          message.channel
            .send(
              "```json\n" +
                JSON.stringify(
                  err?.response?.data || "{'message':'Error'}",
                  null,
                  2,
                ) +
                "\n```",
            )
            .then((res) => resolve(res));
        });
    });
  }
}
