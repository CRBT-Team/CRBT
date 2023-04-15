import { servers } from '$lib/env';
import { Intents } from 'discord.js';
import {
  ChatCommandHandler,
  ContextCommandHandler,
  defineConfig,
  TextCommandHandler,
} from 'purplet';

const intents = new Intents([
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_WEBHOOKS,
  Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
  Intents.FLAGS.GUILD_MEMBERS,
]);

if (process.argv.includes('--dev')) {
  intents.add([
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ]);
}
// console.log(intents.toArray());

export default defineConfig({
  compiler: {
    esbuildOptions: {
      minify: true,
      minifyWhitespace: true,
    },
  },
  discord: {
    commandGuilds: process.argv.includes('--dev')
      ? [
          servers.community,
          '516410163230539837',
          '403966971147845636',
          '939464042173583381',
          '738747595438030888',
        ] // CRBT Commnity
      : [],
    //@ts-ignore
    clientOptions: {
      allowedMentions: {
        repliedUser: false,
      },
      intents,
    },
  },
  handlers: [
    new ChatCommandHandler(),
    new ContextCommandHandler(),
    new TextCommandHandler({
      prefix: process.argv.includes('--dev')
        ? ['<@!859369676140314624>', '<@859369676140314624>', '<@!959733838140026900>', '()']
        : ['<@!595731552709771264>', '<@595731552709771264>'],
    }),
  ],
});
