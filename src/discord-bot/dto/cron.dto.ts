// import { ArgNum, ArgRange } from "discord-nestjs";
import { Expose } from "class-transformer";
import { IsString, IsArray, IsNumber, Min } from "class-validator";

export class CronDto {
  @Expose()
  @IsString()
  // @ArgNum(() => ({ position: 1 }))
  operation: string;

  @Expose()
  @IsString()
  // @ArgNum(() => ({ position: 2 }))
  handler: string;
}
