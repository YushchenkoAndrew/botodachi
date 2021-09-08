import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(private httpService: HttpService) {}

  @Cron("*/1 * * * * *")
  testCron() {
    this.httpService.get(`http://${process.env.API_HOST}/api/ping`).subscribe(
      (data) => console.log(data.data),
      (err) => console.log(err),
    );

    this.httpService
      .get(`http://${process.env.WEB_HOST}/projects/api/ping`)
      .subscribe(
        (data) => console.log(data.data),
        (err) => console.log(err),
      );

    this.logger.log("Pass 5 sec");
  }
}
