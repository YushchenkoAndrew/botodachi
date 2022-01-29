import { Client } from "discord.js";

export const discordClientProvider = {
  provide: "DISCORD_CLIENT",
  useFactory: (): Client<boolean> => {
    const client = new Client({
      intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"],
      partials: ["MESSAGE", "CHANNEL"],
    });
    client.login(process.env.DISCORD_TOKEN);
    return client;
  },
};
