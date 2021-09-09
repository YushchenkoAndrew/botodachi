import { Injectable, Logger } from "@nestjs/common";
import { Once, OnCommand } from "discord-nestjs";
import { Message } from "discord.js";
import { DiscordBotService } from "./discord-bot.service";

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
  onHelp(message: Message): void {
    return this.botService.getCommands(message);
  }
}
