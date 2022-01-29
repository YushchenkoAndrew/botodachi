import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { CronController } from "./cron.controller";
import { CronService } from "./cron.service";

@Module({
  imports: [HttpModule],
  controllers: [CronController],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}
