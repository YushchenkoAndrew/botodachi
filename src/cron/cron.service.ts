import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { WebhookClient } from "discord.js";

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);
  private readonly discordLogger = new WebhookClient(
    process.env.DISCORD_WEBHOOK_ID,
    process.env.DISCORD_WEBHOOK_TOKEN,
  );

  constructor(private httpService: HttpService) {}

  @Cron("*/50 * * * * *")
  testCron() {
    // this.httpService.get(`http://${process.env.API_HOST}/api/ping`).subscribe(
    //   (data) => console.log(data.data),
    //   (err) => console.log(err),
    // );

    // this.httpService
    //   .get(`http://${process.env.WEB_HOST}/projects/api/ping`)
    //   .subscribe(
    //     (data) => console.log(data.data),
    //     (err) => console.log(err),
    //   );

    this.logger.log("Pass 5 sec");
    // this.discordLogger.send("Pass 5 sec");
  }
}
