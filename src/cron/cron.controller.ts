import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
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
import { UpdateCronDto } from "./dto/update-cron.dto";
import { CronEntity } from "./entity/cron.entity";

@ApiTags("cron")
@Controller("cron")
export class CronController {
  constructor(private readonly cronService: CronService) {}

  // @ApiBearerAuth("Authorization")
  // @ApiResponse({ status: HttpStatus.CREATED })
  // @ApiResponse({ status: HttpStatus.UNAUTHORIZED })
  // @ApiHeader({
  //   name: "X-Custom-Header",
  //   description: "Random generated slat",
  //   required: true,
  //   example: "547",
  // })
  // @Get("/subscribe")
  // @HttpCode(HttpStatus.CREATED)
  // @HttpCode(HttpStatus.UNAUTHORIZED)
  // getAllInfo(): void {
  //   // TODO:
  //   // return this.cronService.subscribe(body);
  // }

  @ApiBearerAuth("Authorization")
  @ApiResponse({ status: HttpStatus.OK, type: CronEntity })
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
  getInfo(@Param("id") id: string, @Res() res: Response) {
    this.cronService.readSubscription(id, res);
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
  postInfo(@Body() body: CreateCronDto, @Res() res: Response) {
    this.cronService.subscribe(body, res);
  }

  @ApiBearerAuth("Authorization")
  @ApiResponse({ status: HttpStatus.OK, type: CronEntity })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED })
  @ApiHeader({
    name: "X-Custom-Header",
    description: "Random generated slat",
    required: true,
    example: "547",
  })
  @Put("/subscribe/:id")
  @HttpCode(HttpStatus.OK)
  @HttpCode(HttpStatus.NOT_FOUND)
  @HttpCode(HttpStatus.UNAUTHORIZED)
  putInfo(
    @Param("id") id: string,
    @Body() body: UpdateCronDto,
    @Res() res: Response,
  ) {
    this.cronService.updateSubscription(id, body, res);
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
  postAlert(@Param("id") id: string, @Res() res: Response) {
    this.cronService.unsubscribe(id, res);
  }
}
