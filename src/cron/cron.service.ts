import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { WebhookClient } from "discord.js";
import md5 from "lib/md5";
import { lastValueFrom } from "rxjs";

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  private readonly webUrl = process.env.WEB_URL;
  private readonly webKey = process.env.WEB_KEY;
  private readonly webPepper = process.env.WEB_PEPPER;

  constructor(private httpService: HttpService) {}

  private handlePing(url: string): Promise<string> {
    return lastValueFrom(this.httpService.get(url))
      .then((res) => res.data.message)
      .catch(() => "Unable to reach");
  }

  @Cron("00 00 00 */1 * *")
  testCron() {
    // this.discordLogger.send(
    //   "```css\n[" + Date().toString() + "]``````yaml\nbotodachi: pong\n```",
    // );
    // this.handlePing(`${process.env.WEB_URL}/api/ping`).then((res) =>
    //   this.discordLogger.send("```yaml\nweb: " + res + "\n```"),
    // );
    // this.handlePing(`${process.env.API_URL}/ping`).then((res) =>
    //   this.discordLogger.send("```yaml\napi: " + res + "\n```"),
    // );
  }

  @Cron("* 59 */3 * * *")
  updatePsqlData() {
    const salt = md5((Math.random() * 10000 + 500).toString());
    this.httpService.post(
      `${this.webUrl}/api/cache/upload?key=${md5(
        salt + this.webPepper + this.webKey,
      )}`,
      "",
      { headers: { ["X-Custom-Header"]: salt } },
    );
  }

  @Cron("00 00 00 */1 * *")
  resetWebData() {
    const salt = md5((Math.random() * 10000 + 500).toString());
    this.httpService.post(
      `${this.webUrl}/api/cache/reset?key=${md5(
        salt + this.webPepper + this.webKey,
      )}`,
      "",
      { headers: { ["X-Custom-Header"]: salt } },
    );
  }
}
