import { IsString, IsOptional } from "class-validator";

export class MessageDto {
  @IsOptional()
  @IsString()
  stat: string;

  @IsString()
  name: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  desc: string;
}
