import { Body, Controller, HttpCode, Post, HttpStatus } from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiHeader,
  ApiResponse,
} from "@nestjs/swagger";
import { Message } from "discord.js";
import { MessageDto } from "./dto/message.dto";
import { LogsService } from "./logs.service";

@ApiTags("logs")
@Controller("logs")
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @ApiBearerAuth("Authorization")
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED })
  @ApiHeader({
    name: "X-Custom-Header",
    description: "Random generated slat",
    required: true,
    example: "547",
  })
  @Post("/info")
  @HttpCode(HttpStatus.NO_CONTENT)
  postInfo(@Body() body: MessageDto): Promise<Message | void> {
    return this.logsService.logMessage("info", body);
  }

  @ApiBearerAuth("Authorization")
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED })
  @ApiHeader({
    name: "X-Custom-Header",
    description: "Random generated slat",
    required: true,
    example: "547",
  })
  @Post("/alert")
  @HttpCode(HttpStatus.NO_CONTENT)
  postAlert(@Body() body: MessageDto): Promise<Message | void> {
    return this.logsService.logMessage("alert", body);
  }
}
