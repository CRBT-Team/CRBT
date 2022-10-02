import { REST } from "@discordjs/rest";

export const rest = new REST().setToken(process.env.DISCORD_TOKEN);
