import { ChatCommandHandler, defineConfig, TextCommandHandler } from 'purplet';

export default defineConfig({
  discord: {
//     commandGuilds: [],
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
