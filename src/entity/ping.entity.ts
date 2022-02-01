import { ApiProperty } from "@nestjs/swagger";

export class PingEntity {
  @ApiProperty()
  stat: "OK" | "ERR";

  @ApiProperty()
  message: string;
}
