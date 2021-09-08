import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CronService } from "./cron/cron.service";
import { CronModule } from "./cron/cron.module";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    CronModule,
    HttpModule,
  ],
  controllers: [AppController],
  providers: [AppService, CronService],
})
export class AppModule {}
