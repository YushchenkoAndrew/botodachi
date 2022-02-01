import { REST } from "@discordjs/rest";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { Routes } from "discord-api-types/v9";
import {
  CacheType,
  Client,
  CommandInteraction,
  Interaction,
  Message,
  TextChannel,
} from "discord.js";
import { DiscordBotService } from "./discord-bot.service";
import { SlashCommandBuilder } from "@discordjs/builders";

@Injectable()
export class DiscordBotGateway {
  constructor(
    @Inject("DISCORD_CLIENT") private readonly client: Client<boolean>,
    private readonly eventEmitter: EventEmitter2,
    private readonly botService: DiscordBotService,
    configService: ConfigService,
  ) {
    this.client.once("ready", async () => {
      if (!this.client.user || !this.client.application) return;

      const rest = new REST({ version: "9" }).setToken(
        process.env.DISCORD_TOKEN,
      );

      await rest.put(
        Routes.applicationCommands(process.env.BOT_APPLICATION_ID),
        { body: configService.get("commands") },
      );

      this.eventEmitter.emit("ready", "OK");
    });

    this.client.on(
      "interactionCreate",
      (interaction: Interaction<CacheType>) => {
        if (!interaction.isCommand()) return;
        this.eventEmitter.emit(
          `cmd/${interaction.commandName}/${
            interaction.options.getSubcommand(false) ?? ""
          }`,
          interaction,
        );
      },
    );

    // FIXME:
    const data = new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Replies with Pong!")
      .addIntegerOption((option) =>
        option.setName("input").setDescription("Enter a string"),
      );

    console.dir(data.toJSON(), { depth: null });
  }

  @OnEvent("ready")
  onReady(): Promise<Message> {
    return new Promise<Message>(async (resolve, reject) => {
      this.client.channels
        .fetch(process.env.DISCORD_GENERAL_CH)
        .then((channel: TextChannel) => resolve(this.botService.init(channel)))
        .catch((err) => {
          this.botService.log(err);
          reject();
        });
    });
  }

  @OnEvent("cmd/ping/")
  async onPing(interaction: CommandInteraction<CacheType>): Promise<void> {
    return this.botService.pingAll(interaction);
  }

  @OnEvent("cmd/meme/")
  async onMeme(interaction: CommandInteraction<CacheType>) {
    return this.botService.getMemes(interaction);
  }

  @OnEvent("cmd/web/cache-run")
  async onWebCacheRun(
    interaction: CommandInteraction<CacheType>,
  ): Promise<void> {
    return this.botService.webCacheRun(interaction);
  }

  @OnEvent("cmd/web/cache-upload")
  async onWebCacheUpload(
    interaction: CommandInteraction<CacheType>,
  ): Promise<void> {
    return this.botService.webCacheUpload(interaction);
  }

  @OnEvent("cmd/web/cache-clear")
  async onWebCacheClear(
    interaction: CommandInteraction<CacheType>,
  ): Promise<void> {
    return this.botService.webCacheClear(interaction);
  }

  @OnEvent("cmd/api/cache-run")
  async onApiCacheRun(
    interaction: CommandInteraction<CacheType>,
  ): Promise<void> {
    return this.botService.apiCacheRun(interaction);
  }

  @OnEvent("cmd/api/get-all")
  async onApiGetAll(interaction: CommandInteraction<CacheType>): Promise<void> {
    return this.botService.apiGetAll(interaction);
  }

  @OnEvent("cmd/api/exec")
  async onApiPodExec(
    interaction: CommandInteraction<CacheType>,
  ): Promise<void> {
    return this.botService.apiPodExec(interaction);
  }

  @OnEvent("cmd/void/link")
  async onVoidGetLink(
    interaction: CommandInteraction<CacheType>,
  ): Promise<void> {
    return this.botService.voidGetLink(interaction);
  }

  // NOTE: VOID:
  // * Be able to generate link to the location of specific project
  // * Be able to load/save locally files

  // NOTE: API
  // * Be able to Get info about container
  // * Be able to Run command inside specific container (same as Redis)

  // @OnCommand({ name: "cron" })
  // @UsePipes(TransformPipe)
  // onCron(
  //   @Content() context: CronDto,
  //   @Context() [message]: [Message],
  // ): Promise<Message> {
  //   const handler =
  //     context.operation +
  //     context.handler.charAt(0).toUpperCase() +
  //     context.handler.slice(1);
  //   if (!this.botService[handler]) {
  // message.channel.send(`Cron command '${context.handler}' not Found`);
  //   }

  //   return this.botService[handler](message);
  // }

  // @OnCommand({ name: "web" })
  // @UsePipes(TransformPipe)
  // onWeb(
  //   @Content() context: WebDto,
  //   @Context() [message]: [Message],
  // ): Promise<Message> {
  //   const handler =
  //     "web" +
  //     context.operation.charAt(0).toUpperCase() +
  //     context.operation.slice(1);
  //   if (!this.botService[handler]) {
  //     message.channel.send(`Web command '${context.operation}' not Found`);
  //   }

  //   return this.botService[handler](context.command.join(" "), message);
  // }

  // @OnCommand({ name: "api" })
  // @UsePipes(TransformPipe)
  // onApi(
  //   @Content() context: ApiDto,
  //   @Context() [message]: [Message],
  // ): Promise<Message> {
  //   const handler =
  //     "api" +
  //     context.operation.charAt(0).toUpperCase() +
  //     context.operation.slice(1);
  //   if (!this.botService[handler]) {
  //     message.channel.send(`Api command '${context.operation}' not Found`);
  //   }

  //   return this.botService[handler](context.command.join(" "), message);
  // }

  // @OnCommand({ name: "void" })
  // @UsePipes(TransformPipe)
  // onVoid(
  //   @Content() context: WebDto,
  //   @Context() [message]: [Message],
  // ): Promise<Message> {
  //   //TODO: Upload files from Discord to Void
  //   // const handler =
  //   //   "web" +
  //   //   context.operation.charAt(0).toUpperCase() +
  //   //   context.operation.slice(1);
  //   // if (!this.botService[handler]) {
  //   //   message.channel.send(`Web command '${context.operation}' not Found`);
  //   // }

  //   // return this.botService[handler](context.command.join(" "), message);
  //   return this.botService.getCommands(message);
  // }
}
