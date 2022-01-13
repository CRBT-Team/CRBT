import { ChatCommandHandler, defineConfig, OnEventHandler, TextCommandHandler } from 'purplet';

export default defineConfig({
  discord: {
    commandGuilds: [],
    clientOptions: {
      allowedMentions: {
        repliedUser: false,
      },
      //@ts-ignore
      intents: ['GUILDS'],
    },
  },
  handlers: [
    new ChatCommandHandler(),
    new TextCommandHandler({
      prefix: [
        '<@!859369676140314624>',
        '<@859369676140314624>',
        '<@!595731552709771264>',
        '<@595731552709771264>',
        '()',
      ],
    }),
    new OnEventHandler(),
  ],
});
