import { Controller, Get, HttpStatus, Post } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";
import { AppService } from "./app.service";
import { PingEntity } from "./entity/ping.entity";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/ping")
  @ApiResponse({ status: HttpStatus.OK, type: PingEntity })
  pingPong(): PingEntity {
    return this.appService.pingPong();
  }
}
