import { ChatCommandHandler, defineConfig, TextCommandHandler } from 'purplet';

export default defineConfig({
  discord: {
    // commandGuilds: ['782584672298729473', '832924281519341638'],
    clientOptions: {
      allowedMentions: {
        repliedUser: false,
      },
      //@ts-ignore
      intents: ['GUILD_PRESENCES', 'GUILDS'],
    },
  },
  handlers: [
    new ChatCommandHandler(),
    new TextCommandHandler({
      prefix: ['//'],
    }),
  ],
});
