import {
  CacheInterceptor,
  CACHE_MANAGER,
  Inject,
  Injectable,
  Logger,
  UseInterceptors,
} from "@nestjs/common";
import {
  CacheType,
  CommandInteraction,
  Message,
  MessagePayload,
  TextChannel,
} from "discord.js";
import { WebService } from "src/web/web.service";
import { ApiService } from "src/api/api.service";
import { VoidService } from "src/void/void.service";
import { RedditService } from "src/reddit/reddit.service";
import { Cache } from "cache-manager";

@Injectable()
export class DiscordBotService {
  private readonly logger = new Logger(DiscordBotService.name);

  constructor(
    private readonly webService: WebService,
    private readonly apiService: ApiService,
    private readonly voidService: VoidService,
    private readonly redditService: RedditService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
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

  @UseInterceptors(CacheInterceptor)
  async getMemes(message: CommandInteraction<CacheType>) {
    message.reply("Loading...");

    let lastID = (await this.cacheManager.get<string>("REDDIT_AFTER")) ?? "";
    return new Promise<Message | void>((resolve) => {
      this.redditService
        .getPostFromSubreddit("goodanimemes", "top.json", lastID, 100)
        .then(async (result) => {
          let count = 0;
          for (let child of result.data?.children ?? []) {
            if (child.kind !== "t3") continue;

            lastID = `t3_${child.data.id}`;
            message.channel.send({
              files: [child.data.url],
            } as MessagePayload);

            if (++count >= message.options.getInteger("number")) {
              await this.cacheManager.set("REDDIT_AFTER", lastID, {
                ttl: 3600,
              });
              return resolve();
            }
          }
        })
        .catch((err) => resolve(message.channel.send(String(err))));
    });
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

  async apiGetAll(message: CommandInteraction<CacheType>): Promise<void> {
    return message.reply({
      files: [
        {
          name: "response.json",
          attachment: Buffer.from(
            await this.apiService.getAllK3s(message.options.getString("name")),
            "utf8",
          ),
        },
      ],
    } as MessagePayload);
  }

  async apiPodExec(message: CommandInteraction<CacheType>): Promise<void> {
    return message.reply({
      files: [
        {
          name: "response.json",
          attachment: Buffer.from(
            await this.apiService.execPod(
              message.options.getString("id"),
              message.options.getString("command"),
            ),
            "utf8",
          ),
        },
      ],
    } as MessagePayload);
  }

  // FIXME: Be able to dynamically update value
  async voidGetLink(message: CommandInteraction<CacheType>): Promise<void> {
    return message.reply(
      `${process.env.VOID_URL}/${message.options.getString("name")}`,
    );
  }
}
