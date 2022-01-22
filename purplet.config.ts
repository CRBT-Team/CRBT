import { Intents } from 'discord.js';
import { ChatCommandHandler, defineConfig, OnEventHandler, TextCommandHandler } from 'purplet';
export default defineConfig({
  discord: {
    commandGuilds: process.argv.includes('--dev') ? ['782584672298729473'] : [],
    clientOptions: {
      allowedMentions: {
        repliedUser: false,
      },
      //@ts-ignore
      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES],
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
