import { Controller, Get, Post } from "@nestjs/common";
import { AppService } from "./app.service";
import { Ping } from "./interfaces/ping.interface";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/ping")
  pingPong(): Ping {
    return this.appService.pingPong();
  }
}
