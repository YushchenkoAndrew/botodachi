import { IsString, IsOptional } from "class-validator";

export class MessageDto {
  @IsOptional()
  @IsString()
  stat: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  file: string;

  @IsString()
  message: string;

  @IsOptional()
  desc: any;
}
