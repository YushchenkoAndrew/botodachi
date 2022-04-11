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
import { Response } from "express";
import { ApiService } from "src/api/api.service";
import { VoidService } from "src/void/void.service";
import { WebService } from "src/web/web.service";
import { CreateCronDto } from "./dto/create-cron.dto";
import { CronEntity } from "./entity/cron.entity";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom, Observable } from "rxjs";
import { v4 as uuid } from "uuid";
import { UpdateCronDto } from "./dto/update-cron.dto";
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

  FormReq(): Observable<AxiosResponse<any, any>> | null {
    switch (this.body.method) {
      case "get":
        return this.httpService.get(this.body.url, {
          headers: { Authorization: `Bear: ${this.body.token}` },
        });

      case "post":
        return this.httpService.post(this.body.url, this.body.data, {
          headers: { Authorization: `Bear: ${this.body.token}` },
        });

      case "put":
        return this.httpService.put(this.body.url, this.body.data, {
          headers: { Authorization: `Bear: ${this.body.token}` },
        });

      case "delete":
        return this.httpService.delete(this.body.url, {
          headers: { Authorization: `Bear: ${this.body.token}` },
        });

      default:
        return null;
    }
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

  @Cron("00 55 */3 * * *")
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
  readSubscription(id: string): CronEntity | null {
    const jobs = this.schedulerRegistry.getCronJobs() as Map<
      string,
      CachedCronJob
    >;
    for (const key of Array.from(jobs.keys())) {
      if (key == id) {
        return { id, exec: jobs.get(key).GetBody() };
      }
    }

    return null;
  }

  @UseInterceptors(CacheInterceptor)
  updateSubscription(id: string, body: UpdateCronDto, res: Response) {
    if (!this.readSubscription(id)) {
      return res.status(HttpStatus.NOT_FOUND).send();
    }

    const job = this.schedulerRegistry.getCronJob(id) as CachedCronJob;

    job.stop();
    this.schedulerRegistry.deleteCronJob(id);

    const prev = job.GetBody();
    return this.subscribe(
      {
        cron_time: body.cron_time || prev.cron_time,
        method: body.method || prev.method,
        token: body.token || prev.token,
        url: body.url || prev.url,
        data: body.data || prev.data,
      },
      res,
    );
  }

  @UseInterceptors(CacheInterceptor)
  subscribe(body: CreateCronDto, res: Response) {
    const job = new CachedCronJob(
      body.cron_time,
      function () {
        const req = this.FormReq();
        if (!req) return;

        lastValueFrom(req).catch((err) =>
          console.log(`Ohhh nyo something is broken\n: ${err}`),
        );
      },
      body,
      this.httpService,
    );

    const id = uuid();
    this.logger.log(`Create new cron id=${id}`);
    this.schedulerRegistry.addCronJob(id, job);
    return res.status(HttpStatus.CREATED).send({ id, exec: body });
  }

  @UseInterceptors(CacheInterceptor)
  unsubscribe(id: string, res: Response) {
    const job = this.schedulerRegistry.getCronJob(id);
    if (!job) return res.status(HttpStatus.NOT_FOUND).send();

    job.stop();
    this.schedulerRegistry.deleteCronJob(id);
    res.status(HttpStatus.OK).send();
  }
}
