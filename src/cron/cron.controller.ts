import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiHeader,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Response } from "express";
import { CronService } from "./cron.service";
import { CreateCronDto } from "./dto/create-cron.dto";
import { CronEntity } from "./entity/cron.entity";

@ApiTags("cron")
@Controller("cron")
export class CronController {
  constructor(private readonly cronService: CronService) {}

  @ApiBearerAuth("Authorization")
  @ApiResponse({ status: HttpStatus.CREATED })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED })
  @ApiHeader({
    name: "X-Custom-Header",
    description: "Random generated slat",
    required: true,
    example: "547",
  })
  @Get("/subscribe")
  @HttpCode(HttpStatus.CREATED)
  @HttpCode(HttpStatus.UNAUTHORIZED)
  getAllInfo(): void {
    // TODO:
    // return this.cronService.subscribe(body);
  }

  @ApiBearerAuth("Authorization")
  @ApiResponse({ status: HttpStatus.CREATED, type: CronEntity })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED })
  @ApiHeader({
    name: "X-Custom-Header",
    description: "Random generated slat",
    required: true,
    example: "547",
  })
  @Get("/subscribe/:id")
  @HttpCode(HttpStatus.CREATED)
  @HttpCode(HttpStatus.NOT_FOUND)
  @HttpCode(HttpStatus.UNAUTHORIZED)
  getInfo(@Param("id") id: string, @Res() res: Response): CronEntity | void {
    return this.cronService.getSubscription(id, res);
  }

  @ApiBearerAuth("Authorization")
  @ApiResponse({ status: HttpStatus.CREATED, type: CronEntity })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED })
  @ApiHeader({
    name: "X-Custom-Header",
    description: "Random generated slat",
    required: true,
    example: "547",
  })
  @Post("/subscribe")
  @HttpCode(HttpStatus.CREATED)
  @HttpCode(HttpStatus.UNAUTHORIZED)
  postInfo(@Body() body: CreateCronDto): CronEntity | void {
    return this.cronService.subscribe(body);
  }

  @ApiBearerAuth("Authorization")
  @ApiResponse({ status: HttpStatus.OK, type: String })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED })
  @ApiHeader({
    name: "X-Custom-Header",
    description: "Random generated slat",
    required: true,
    example: "547",
  })
  @Delete("/subscribe/:id")
  @HttpCode(HttpStatus.OK)
  @HttpCode(HttpStatus.UNAUTHORIZED)
  postAlert(@Param("id") id: string, @Res() res: Response): void {
    return this.cronService.unsubscribe(id, res);
  }
}
