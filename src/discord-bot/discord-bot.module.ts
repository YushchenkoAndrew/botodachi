import { discordClientProvider } from "./discord-bot.provider";
import { HttpModule } from "@nestjs/axios";
import { CacheModule, Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { DiscordBotGateway } from "./discord-bot.gateway";
import { DiscordBotService } from "./discord-bot.service";
import config from "../../config/discord-bot";
import { ConfigModule } from "@nestjs/config";
import { WebModule } from "src/web/web.module";
import { ApiModule } from "src/api/api.module";
import { VoidModule } from "src/void/void.module";
import { RedditModule } from "src/reddit/reddit.module";

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({ load: [config] }),
    CacheModule.register(),
    HttpModule,
    WebModule,
    ApiModule,
    VoidModule,
    RedditModule,
  ],
  providers: [discordClientProvider, DiscordBotGateway, DiscordBotService],
  exports: [discordClientProvider],
})
export class DiscordBotModule {}
