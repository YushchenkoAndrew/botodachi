import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { WebhookClient } from "discord.js";
import { lastValueFrom } from "rxjs";

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);
  private readonly discordLogger = new WebhookClient(
    process.env.DISCORD_WEBHOOK_ID,
    process.env.DISCORD_WEBHOOK_TOKEN,
  );

  constructor(private httpService: HttpService) {}

  private handlePing(url: string): Promise<string> {
    return lastValueFrom(this.httpService.get(url))
      .then((res) => res.data.message)
      .catch(() => "Unable to reach");
  }

  @Cron("00 00 00 */1 * *")
  testCron() {
    this.discordLogger.send(
      "```css\n[" + Date().toString() + "]``````yaml\nbotodachi: pong\n```",
    );
    this.handlePing(`${process.env.WEB_URL}/api/ping`).then((res) =>
      this.discordLogger.send("```yaml\nweb: " + res + "\n```"),
    );
    this.handlePing(`${process.env.API_URL}/ping`).then((res) =>
      this.discordLogger.send("```yaml\napi: " + res + "\n```"),
    );
  }

  @Cron("* 59 */3 * * *")
  updatePsqlData() {
    this.httpService.post(
      `${process.env.WEB_URL}/api/cache/upload?key=${process.env.WEB_KEY}`,
    );
  }

  @Cron("00 00 00 */1 * *")
  resetWebData() {
    this.httpService.post(
      `${process.env.WEB_URL}/api/cache/reset?key=${process.env.WEB_KEY}`,
    );
  }
}
