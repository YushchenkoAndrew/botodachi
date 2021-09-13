import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CronService } from "./cron/cron.service";
import { CronModule } from "./cron/cron.module";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";
import { DiscordBotModule } from "./discord-bot/discord-bot.module";
import { LogsController } from './logs/logs.controller';
import { LogsService } from './logs/logs.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    CronModule,
    HttpModule,
    DiscordBotModule,
  ],
  controllers: [AppController, LogsController],
  providers: [AppService, CronService, LogsService],
})
export class AppModule {}
