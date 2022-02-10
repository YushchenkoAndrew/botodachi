import { ApiProperty } from "@nestjs/swagger";
import { CreateCronDto } from "../dto/create-cron.dto";

export class CronEntity {
  @ApiProperty({ example: "d266389ebf09e1e8a95a5b4286b504b2" })
  id: string;

  // @ApiProperty({
  //   example: "Mon Jan 31 2022 00:00:00 GMT+0000 (Coordinated Universal Time)",
  // })
  // created_at: string;

  @ApiProperty()
  exec: CreateCronDto;
}
