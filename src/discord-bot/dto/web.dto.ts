// import { ArgNum, ArgRange } from "discord-nestjs";
import { Expose } from "class-transformer";
import { IsString, IsArray, IsNumber, Min } from "class-validator";

export class WebDto {
  @Expose()
  @IsString()
  // @ArgNum(() => ({ position: 1 }))
  operation: string;

  @Expose()
  @IsArray()
  // @ArgRange((last: number) => ({ formPosition: 2, last }))
  command: string[];
}
