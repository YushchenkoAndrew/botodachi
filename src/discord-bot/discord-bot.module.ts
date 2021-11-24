import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { DiscordModule, TransformPipe } from "discord-nestjs";
import { DiscordBotGateway } from "./discord-bot.gateway";
import { DiscordBotService } from "./discord-bot.service";

@Module({
  imports: [
    DiscordModule.forRoot({
      token: process.env.DISCORD_TOKEN,
      commandPrefix: "$",
      webhook: {
        webhookId: process.env.DISCORD_WEBHOOK_ID,
        webhookToken: process.env.DISCORD_TOKEN,
      },
      // usePipes: [TransformPipe, ValidationPipe],
    }),
    HttpModule,
  ],
  providers: [DiscordBotGateway, DiscordBotService],
})
export class DiscordBotModule {}
