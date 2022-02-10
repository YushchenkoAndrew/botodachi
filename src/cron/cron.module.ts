import { HttpModule } from "@nestjs/axios";
import { CacheModule, MiddlewareConsumer, Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { ApiModule } from "src/api/api.module";
import { AuthMiddleware } from "src/auth.middleware";
import { DiscordBotModule } from "src/discord-bot/discord-bot.module";
import { VoidModule } from "src/void/void.module";
import { WebModule } from "src/web/web.module";
import { CronController } from "./cron.controller";
import { CronService } from "./cron.service";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CacheModule.register(),
    HttpModule,
    DiscordBotModule,
    WebModule,
    ApiModule,
    VoidModule,
  ],
  controllers: [CronController],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes("/cron/subscribe", "/cron/subscribe/:id");
  }
}
