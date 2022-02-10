import { Intents } from 'discord.js';
import {
  ChatCommandHandler,
  ContextCommandHandler,
  defineConfig,
  TextCommandHandler,
} from 'purplet';

export default defineConfig({
  discord: {
    commandGuilds: process.argv.includes('--dev') ? ['782584672298729473'] : [],
    clientOptions: {
      allowedMentions: {
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
      prefix: [
        '<@!859369676140314624>',
        '<@859369676140314624>',
        '<@!595731552709771264>',
        '<@595731552709771264>',
        '()',
      ],
    }),
  ],
});

// export const activity = ActivityProvider({
//   getActivity() {
//     return {
//       name: '/crbt info | crbt.ga',
//     };
//   },
// });
