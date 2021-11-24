import { Injectable, Logger, UsePipes } from "@nestjs/common";
import {
  Content,
  Context,
  Once,
  OnCommand,
  TransformPipe,
} from "discord-nestjs";
import { Message } from "discord.js";
import { DiscordBotService } from "./discord-bot.service";
import { ApiDto } from "./dto/api.dto";
import { CronDto } from "./dto/cron.dto";
import { WebDto } from "./dto/web.dto";

@Injectable()
export class DiscordBotGateway {
  constructor(private botService: DiscordBotService) {}

  @Once({ event: "ready" })
  onReady(): void {
    return this.botService.Init();
  }

  @OnCommand({ name: "ping" })
  onPing(message: Message): void {
    return this.botService.getCurrStatus(message);
  }

  @OnCommand({ name: "help" })
  onHelp(message: Message): Promise<Message> {
    return this.botService.getCommands(message);
  }

  @OnCommand({ name: "cron" })
  @UsePipes(TransformPipe)
  onCron(
    @Content() context: CronDto,
    @Context() [message]: [Message],
  ): Promise<Message> {
    const handler =
      context.operation +
      context.handler.charAt(0).toUpperCase() +
      context.handler.slice(1);
    if (!this.botService[handler]) {
      message.channel.send(`Cron command '${context.handler}' not Found`);
    }

    return this.botService[handler](message);
  }

  @OnCommand({ name: "web" })
  @UsePipes(TransformPipe)
  onWeb(
    @Content() context: WebDto,
    @Context() [message]: [Message],
  ): Promise<Message> {
    const handler =
      "web" +
      context.operation.charAt(0).toUpperCase() +
      context.operation.slice(1);
    if (!this.botService[handler]) {
      message.channel.send(`Web command '${context.operation}' not Found`);
    }

    return this.botService[handler](context.command.join(" "), message);
  }

  @OnCommand({ name: "api" })
  @UsePipes(TransformPipe)
  onApi(
    @Content() context: ApiDto,
    @Context() [message]: [Message],
  ): Promise<Message> {
    const handler =
      "api" +
      context.operation.charAt(0).toUpperCase() +
      context.operation.slice(1);
    if (!this.botService[handler]) {
      message.channel.send(`Api command '${context.operation}' not Found`);
    }

    return this.botService[handler](context.command.join(" "), message);
  }

  @OnCommand({ name: "void" })
  @UsePipes(TransformPipe)
  onVoid(
    @Content() context: WebDto,
    @Context() [message]: [Message],
  ): Promise<Message> {
    //TODO: Upload files from Discord to Void
    // const handler =
    //   "web" +
    //   context.operation.charAt(0).toUpperCase() +
    //   context.operation.slice(1);
    // if (!this.botService[handler]) {
    //   message.channel.send(`Web command '${context.operation}' not Found`);
    // }

    // return this.botService[handler](context.command.join(" "), message);
    return this.botService.getCommands(message);
  }
}
