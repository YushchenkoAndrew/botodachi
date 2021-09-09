import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { DiscordModule } from "discord-nestjs";
import { DiscordBotGateway } from "./discord-bot.gateway";
import { DiscordBotService } from './discord-bot.service';

@Module({
  imports: [
    DiscordModule.forRoot({
      token: process.env.DISCORD_TOKEN,
      commandPrefix: "$",
    }),
    HttpModule,
  ],
  providers: [DiscordBotGateway, DiscordBotService],
})
export class DiscordBotModule {}
