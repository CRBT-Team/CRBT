import { Intents } from 'discord.js';
import {
  ChatCommandHandler,
  ContextCommandHandler,
  defineConfig,
  TextCommandHandler,
} from 'purplet';

export default defineConfig({
  discord: {
    commandGuilds: process.argv.includes('--dev')
      ? [
          '949329353047687189', // CRBT Development
          // '843530687260524585', // Clembs Emoji
          // '832924281519341638', // CRBT Demo
        ]
      : [],
    clientOptions: {
      allowedMentions: {
        parse: ['users'],
        repliedUser: false,
      },
      //@ts-ignore
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_WEBHOOKS,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
      ],
    },
  },
  handlers: [
    new ChatCommandHandler(),
    new ContextCommandHandler(),
    new TextCommandHandler({
      prefix: process.argv.includes('--dev')
        ? ['<@!859369676140314624>', '<@859369676140314624>', '()']
        : ['<@!595731552709771264>', '<@595731552709771264>'],
    }),
  ],
});
