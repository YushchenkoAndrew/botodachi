import { HttpModule } from "@nestjs/axios";
import { CacheModule, Module } from "@nestjs/common";
import { ApiService } from "./api.service";

@Module({
  imports: [HttpModule, CacheModule.register()],
  providers: [ApiService],
  exports: [ApiService],
})
export class ApiModule {}
