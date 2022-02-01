import {
  CACHE_MANAGER,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";
import { Cache } from "cache-manager";
import { CronJob } from "cron";
import { Client, Message, TextChannel, WebhookClient } from "discord.js";
import md5 from "lib/md5";
import { Response } from "express";
import { ApiService } from "src/api/api.service";
import { VoidService } from "src/void/void.service";
import { WebService } from "src/web/web.service";
import { CreateCronDto } from "./dto/create-cron.dto";
import { CronEntity } from "./entity/cron.entity";

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    @Inject("DISCORD_CLIENT") private readonly client: Client<boolean>,
    private readonly schedulerRegistry: SchedulerRegistry,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
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

  getSubscription(id: string, res: Response): Promise<CronEntity | void> {
    return new Promise<CronEntity | void>(async (resolve) => {
      const entity = (await this.cacheManager.get<string>("CRON:" + id)) ?? "";
      if (entity) return resolve(JSON.parse(entity) as CronEntity);
      res.send(HttpStatus.NOT_FOUND);
      resolve();
    });
  }

  subscribe(body: CreateCronDto): Promise<CronEntity> {
    return new Promise<CronEntity>((resolve) => {
      const id = md5(`${Math.round(Math.random() * 100000 + 500)}`);
      this.schedulerRegistry.addCronJob(
        id,
        new CronJob(body.cronTime, () => {
          const salt = md5((Math.random() * 10000 + 500).toString());
          fetch(`${body.url}?key=${md5(salt + process.env.BOT_KEY)}`, {
            method: body.method.toUpperCase(),
            headers: { "X-Custom-Header": salt },
            body: body.data ?? "",
          })
            .then((res) => res.json)
            .then((data) => this.logger.log(data))
            .catch((err) => this.logger.error(err));
        }),
      );

      const res = { id, createdAt: Date().toString(), exec: body };
      this.cacheManager
        .set("CRON:" + id, JSON.stringify(res))
        .then(() => resolve(res))
        .catch((value) =>
          this.sendError("Ohhh nyo cache is broken").then(() => resolve(res)),
        );
    });
  }

  unsubscribe(id: string): Promise<string> {
    return new Promise<string>(async (resolve) => {
      const entity = (await this.cacheManager.get<string>("CRON:" + id)) ?? "";
      if (!entity) return resolve("Failed");

      this.schedulerRegistry.deleteCronJob(id);
      await this.cacheManager.del("CRON:" + id);
      return "Success!!";
    });
  }
}
