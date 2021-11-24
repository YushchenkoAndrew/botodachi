// import { ArgNum, ArgRange } from "discord-nestjs";
import { Expose } from "class-transformer";
import { IsString, IsArray, IsNumber, Min } from "class-validator";

export class VoidDto {
  @Expose()
  @IsString()
  // @ArgNum(() => ({ position: 1 }))
  operation: string;
}
