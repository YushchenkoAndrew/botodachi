import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { DiscordClientProvider } from "discord-nestjs";
import { Message } from "discord.js";
import { lastValueFrom } from "rxjs";

@Injectable()
export class DiscordBotService {
  private readonly logger = new Logger(DiscordBotService.name);

  constructor(
    private readonly discordProvider: DiscordClientProvider,
    private httpService: HttpService,
  ) {}

  Init() {
    this.logger.log(
      `Logged in as ${this.discordProvider.getClient().user.tag}!`,
    );
  }

  private handlePing(url: string): Promise<string> {
    return lastValueFrom(this.httpService.get(url))
      .then((res) => res.data.message)
      .catch(() => "Unable to reach");
  }

  getCurrStatus(message: Message): void {
    message.channel.send("```yaml\nbotodachi: pong\n```");
    this.handlePing(`http://${process.env.WEB_HOST}/projects/api/ping`).then(
      (res) => message.channel.send("```yaml\nweb: " + res + "\n```"),
    );
    this.handlePing(`http://${process.env.API_HOST}/api/ping`).then((res) =>
      message.channel.send("```yaml\napi: " + res + "\n```"),
    );
  }

  getCommands(message: Message): void {
    message.channel.send(["Commands:", "\t● ping", "\t● help"]);
  }
}
