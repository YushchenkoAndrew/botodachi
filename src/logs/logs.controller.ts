import {
  Body,
  Controller,
  HttpCode,
  Post,
  Query,
  Headers,
} from "@nestjs/common";
import { Message } from "discord.js";
import { PassValidate } from "lib/auth";
import md5 from "lib/md5";
import { MessageDto } from "./dto/message.dto";
import { LogsService } from "./logs.service";

@Controller("logs")
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post("/info")
  @HttpCode(204)
  postInfo(
    @Headers("X-Custom-Header") salt = "",
    @Query("key") key = "",
    @Body() body: MessageDto,
  ): Promise<Message | void> {
    if (!PassValidate(md5(salt + process.env.KEY), key)) {
      return new Promise((resolve) => resolve());
    }
    return this.logsService.logMessage("info", body);
  }

  @Post("/alert")
  @HttpCode(204)
  postAlert(
    @Headers("X-Custom-Header") salt: string = "",
    @Query("key") key: string = "",
    @Body() body: MessageDto,
  ): Promise<Message | void> {
    if (!PassValidate(md5(salt + process.env.BOT_KEY), key)) {
      return new Promise((resolve) => resolve());
    }
    return this.logsService.logMessage("alert", body);
  }
}
