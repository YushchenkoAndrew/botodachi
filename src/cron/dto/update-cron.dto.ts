import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateCronDto {
  @ApiPropertyOptional({ example: "00 00 00 */1 * *" })
  cron_time: string;

  @ApiPropertyOptional({ example: "http://127.0.0.1:8000/ping" })
  url: string;

  @ApiPropertyOptional({ example: "post" })
  method: "post" | "get" | "put" | "delete";

  @ApiPropertyOptional({ example: `HELLO_WORLD` })
  token: string;

  @ApiPropertyOptional({ example: `{"data" : "Hello world"}` })
  data?: string;
}
