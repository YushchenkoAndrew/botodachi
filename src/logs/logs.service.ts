import { Inject, Injectable, Logger } from "@nestjs/common";
import { Client, Message, TextChannel, WebhookClient } from "discord.js";
import { MessageDto } from "./dto/message.dto";

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);

  constructor(
    @Inject("DISCORD_CLIENT") private readonly client: Client<boolean>,
  ) {}

  logMessage(stat: string, body: MessageDto): Promise<Message | void> {
    return new Promise<Message | void>((resolve) => {
      this.client.channels
        .fetch(process.env.DISCORD_GENERAL_CH)
        .then((channel: TextChannel) =>
          resolve(
            channel.send(
              "```css\nstat [XXX]\n``````json\nYYY\n```"
                .replace("XXX", stat)
                .replace("YYY", JSON.stringify(body, null, 2)),
            ),
          ),
        )
        .catch((err) => {
          this.logger.error(err);
          resolve(new Promise<void>((resolve) => resolve()));
        });
    });
  }
}
