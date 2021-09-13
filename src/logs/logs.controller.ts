import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { MessageDto } from "./dto/message.dto";
import { LogsService } from "./logs.service";

@Controller("logs")
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post("/info")
  @HttpCode(204)
  postInfo(@Body() body: MessageDto): void {
    return this.logsService.logMessage("info", body);
  }

  @Post("/alert")
  @HttpCode(204)
  postAlert(@Body() body: MessageDto): void {
    return this.logsService.logMessage("alert", body);
  }
}
