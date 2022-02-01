import { HttpModule } from "@nestjs/axios";
import { CacheModule, Module } from "@nestjs/common";
import { RedditService } from "./reddit.service";

@Module({
  imports: [HttpModule, CacheModule.register()],
  providers: [RedditService],
  exports: [RedditService],
})
export class RedditModule {}
