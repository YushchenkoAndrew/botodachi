import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { AxiosResponse } from "axios";
import {
  CacheType,
  CommandInteraction,
  Message,
  TextChannel,
} from "discord.js";
import { lastValueFrom } from "rxjs";
import md5 from "lib/md5";
import { WebService } from "src/web/web.service";
import { ApiService } from "src/api/api.service";
import { VoidService } from "src/void/void.service";

@Injectable()
export class DiscordBotService {
  private readonly logger = new Logger(DiscordBotService.name);

  // private readonly webUrl = process.env.WEB_URL;
  // private readonly webKey = process.env.WEB_KEY;
  // private readonly webPepper = process.env.WEB_PEPPER;

  // private readonly apiUrl = process.env.API_URL;
  // private readonly apiUser = process.env.API_USER;
  // private readonly apiPass = process.env.API_PASS;
  // private readonly apiPepper = process.env.API_PEPPER;

  // private readonly voidUrl = process.env.VOID_URL;

  constructor(
    private readonly webService: WebService,
    private readonly apiService: ApiService,
    private readonly voidService: VoidService,
  ) {}

  init(channel: TextChannel): Promise<Message> {
    return channel.send("Sup everyone!!\nBotodachi is up and running");
  }

  log(message: any) {
    this.logger.error(message);
  }

  private formatMessage(style, prefix, message: string) {
    return `${"```"}${style}\n${prefix}: ${message}\n${"```"}`;
  }

  async pingAll(message: CommandInteraction<CacheType>): Promise<void> {
    return message.reply(
      [
        this.formatMessage("yaml", "botodachi", "pong"),
        this.formatMessage("yaml", "web", await this.webService.ping()),
        this.formatMessage("yaml", "api", await this.apiService.ping()),
        this.formatMessage("yaml", "void", await this.voidService.ping()),
      ].join(""),
    );
  }

  async webCacheRun(message: CommandInteraction<CacheType>): Promise<void> {
    return message.reply(
      this.formatMessage(
        "json",
        "web",
        await this.webService.cacheRun(message.options.getString("command")),
      ),
    );
  }

  async webCacheUpload(message: CommandInteraction<CacheType>): Promise<void> {
    return message.reply(
      this.formatMessage("json", "web", await this.webService.cacheUpload()),
    );
  }

  async webCacheClear(message: CommandInteraction<CacheType>): Promise<void> {
    return message.reply(
      this.formatMessage("json", "web", await this.webService.cacheClear()),
    );
  }

  async apiCacheRun(message: CommandInteraction<CacheType>): Promise<void> {
    return message.reply(
      this.formatMessage(
        "json",
        "api",
        await this.apiService.cacheRun(message.options.getString("command")),
      ),
    );
  }
}
