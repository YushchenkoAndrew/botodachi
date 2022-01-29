import { Module } from "@nestjs/common";
import { DiscordBotModule } from "src/discord-bot/discord-bot.module";
import { LogsController } from "./logs.controller";
import { LogsService } from "./logs.service";

@Module({
  imports: [DiscordBotModule],
  controllers: [LogsController],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}
