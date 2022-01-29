import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { WebService } from "./web.service";

@Module({
  imports: [HttpModule],
  providers: [WebService],
  exports: [WebService],
})
export class WebModule {}
