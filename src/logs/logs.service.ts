import { Injectable } from "@nestjs/common";
import { WebhookClient } from "discord.js";
import { MessageDto } from "./dto/message.dto";

@Injectable()
export class LogsService {
  private readonly discordLogger = new WebhookClient(
    process.env.DISCORD_WEBHOOK_ID,
    process.env.DISCORD_WEBHOOK_TOKEN,
  );

  logMessage(stat: string, body: MessageDto): void {
    this.discordLogger.send(
      "```css\nstat [XXX]\n``````json\nYYY\n```"
        .replace("XXX", stat)
        .replace("YYY", JSON.stringify(body, null, 2)),
    );
  }
}
