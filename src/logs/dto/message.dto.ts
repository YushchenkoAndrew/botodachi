import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class MessageDto {
  @ApiProperty({ example: "OK" })
  stat: string;

  @ApiProperty({ example: "API" })
  name: "WEB" | "API" | "VOID";

  @ApiPropertyOptional()
  url: string;

  @ApiPropertyOptional({ example: "controllers/bot.go" })
  file: string;

  @ApiProperty({ example: "Ohh nooo Cache is broken; Anyway..." })
  message: string;

  @ApiPropertyOptional({ example: "Here we go again" })
  desc: string;
}
