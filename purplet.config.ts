import { ChatCommandHandler, defineConfig, TextCommandHandler } from 'purplet';

export default defineConfig({
  discord: {
    commandGuilds: ['782584672298729473'],
    clientOptions: {
      allowedMentions: {
        repliedUser: false,
      },
      //@ts-ignore
      intents: ['GUILD_PRESENCES'],
    },
  },
  handlers: [
    new ChatCommandHandler(),
    new TextCommandHandler({
      prefix: ['()'],
    }),
  ],
});
