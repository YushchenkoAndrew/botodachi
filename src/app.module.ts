import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CronModule } from "./cron/cron.module";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";
import { DiscordBotModule } from "./discord-bot/discord-bot.module";
import { LogsModule } from "./logs/logs.module";
import { WebModule } from "./web/web.module";
import { ApiModule } from "./api/api.module";
import { VoidModule } from "./void/void.module";
import { CronService } from "./cron/cron.service";
import { RedditModule } from './reddit/reddit.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    CronModule,
    HttpModule,
    DiscordBotModule,
    LogsModule,
    WebModule,
    ApiModule,
    VoidModule,
    RedditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
