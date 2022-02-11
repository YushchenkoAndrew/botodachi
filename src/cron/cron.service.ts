import {
  CacheInterceptor,
  CACHE_MANAGER,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UseInterceptors,
} from "@nestjs/common";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";
import { Cache } from "cache-manager";
import { CronJob } from "cron";
import { Client, Message, TextChannel } from "discord.js";
import md5 from "lib/md5";
import { Response } from "express";
import { ApiService } from "src/api/api.service";
import { VoidService } from "src/void/void.service";
import { WebService } from "src/web/web.service";
import { CreateCronDto } from "./dto/create-cron.dto";
import { CronEntity } from "./entity/cron.entity";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom } from "rxjs";
import { AxiosResponse } from "axios";

class CachedCronJob extends CronJob {
  constructor(
    cronTime: string,
    onTick: () => void,
    private body: CreateCronDto,
    private readonly httpService: HttpService,
  ) {
    super(cronTime, onTick, undefined, true);
  }

  GetBody(): CreateCronDto {
    return this.body;
  }
}

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    @Inject("DISCORD_CLIENT") private readonly client: Client<boolean>,
    private readonly schedulerRegistry: SchedulerRegistry,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly httpService: HttpService,
    private readonly webService: WebService,
    private readonly apiService: ApiService,
    private readonly voidService: VoidService,
  ) {}

  private formatDiscordMessage(style, prefix, message: string) {
    return `${"```"}${style}\n${prefix}: ${message}\n${"```"}`;
  }

  private sendError(message: string): Promise<Message | void> {
    return new Promise<Message | void>((resolve) => {
      this.client.channels
        .fetch(process.env.DISCORD_GENERAL_CH)
        .then((channel: TextChannel) =>
          resolve(
            channel.send(
              this.formatDiscordMessage(
                "css",
                `[${Date().toString()}]`,
                "Some service are unreachable",
              ) + message,
            ),
          ),
        )
        .catch((err) => {
          this.logger.error(err);
          resolve(new Promise<void>((resolve) => resolve()));
        });
    });
  }

  @Cron("00 00 00 */1 * *")
  private pingAll(): Promise<Message | void> {
    return new Promise<Message | void>(async (resolve, reject) => {
      const message = [
        ["web", await this.webService.ping()],
        ["api", await this.apiService.ping()],
        ["void", await this.voidService.ping()],
      ]
        .filter(([key, value]) => value !== "pong")
        .reduce(
          (acc, [key, value]) =>
            acc + this.formatDiscordMessage("yaml", key, value),
          "",
        );

      if (message === "") return resolve();
      this.sendError(message).then((res) => resolve(res));
    });
  }

  @Cron("* 55 */3 * * *")
  private FlushWebCache(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      resolve(this.logger.log(await this.webService.cacheUpload()));
    });
  }

  @Cron("00 00 00 */1 * *")
  private ClearWebCache() {
    return new Promise<void>(async (resolve) => {
      resolve(this.logger.log(await this.webService.cacheClear()));
    });
  }

  // @Cron("00 00 00 */1 * *")
  // private UpdateDiscordCommands() {
  //   return new Promise<void>(async (resolve) => {
  //     resolve(this.logger.log(await this.webService.cacheClear()));
  //   });
  // }

  @UseInterceptors(CacheInterceptor)
  getSubscription(id: string, res: Response): CronEntity | void {
    const job = this.schedulerRegistry.getCronJob(id) as CachedCronJob;
    if (job) return { id, exec: job.GetBody() };
    res.send(HttpStatus.NOT_FOUND);
  }

  @UseInterceptors(CacheInterceptor)
  subscribe(body: CreateCronDto): CronEntity {
    const id = md5(`${Math.round(Math.random() * 100000 + 500)}`);
    const job = new CachedCronJob(
      body.cron_time,
      function () {
        lastValueFrom(
          this.httpService.post(`${this.body.url}`, this.body.data ?? "", {
            headers: {
              Authorization: `Bear: ${this.body.token}`,
            },
          }),
        )
          .then((res: AxiosResponse<string>) => {
            if (
              res.status == HttpStatus.OK ||
              res.status == HttpStatus.CREATED
            ) {
              this.body.token = md5(
                res.data + this.body.token + process.env.BOT_PEPPER,
              );
            }
          })
          .catch(() => console.log("Ohhh nyo something is broken\n"));
      },
      body,
      this.httpService,
    );

    this.schedulerRegistry.addCronJob(id, job);
    return { id, exec: body };
  }

  @UseInterceptors(CacheInterceptor)
  unsubscribe(id: string, res: Response) {
    const job = this.schedulerRegistry.getCronJob(id);
    if (!job) return res.send(HttpStatus.NOT_FOUND);

    job.stop();
    this.schedulerRegistry.deleteCronJob(id);
    res.send(HttpStatus.OK);
  }
}
