import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { VoidService } from "./void.service";

@Module({
  imports: [HttpModule],
  providers: [VoidService],
  exports: [VoidService],
})
export class VoidModule {}
