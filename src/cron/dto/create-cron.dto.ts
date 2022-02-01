import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateCronDto {
  @ApiProperty({ example: "00 00 00 */1 * *" })
  cronTime: string;

  @ApiProperty({ example: "http://127.0.0.1:8000/ping" })
  url: string;

  @ApiProperty({ example: "post" })
  method: "post" | "get" | "put" | "delete";

  @ApiPropertyOptional({ example: `{"data" : "Hello world"}` })
  data?: string;
}
