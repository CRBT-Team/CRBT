import * as all from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { Team } from 'discord.js';
import { TextCommand } from 'purplet';
import { inspect } from 'util';

export default TextCommand({
  name: 'eval',
  async handle(args) {
    if (this.author.id !== ((await this.client.application.fetch()).owner as Team).ownerId) {
      this.reply('shush');
    } else {
      let evalArgs = args.join(' ').replaceAll('```', '').replace('ts', '').replace('js', '');
      const evaluation =
        `
        const db = ${JSON.stringify(all)};
        const This = {
          channel: ${JSON.stringify(this)},
          client: ${JSON.stringify(this.client)},
          author: ${JSON.stringify(this.author)},
          guild: ${JSON.stringify(this.guild)},
          member: ${JSON.stringify(this.member)},
        };
        ` + evalArgs;

      try {
        if (evalArgs.includes('this.reply(')) {
          const send = evalArgs.replace(/this\.reply\((.*)/, '$1');
          console.log(send);
          const evaled = (0, eval)(send[send.length - 1]);
          const cleaned = await clean(evaled);

          this.reply(cleaned);
        } else {
          const evaled = (0, eval)(evaluation);
          const cleaned = await clean(evaled);
          this.reply(`\`\`\`ts\n${cleaned}\n\`\`\``);
        }

        this.react('🏳');
      } catch (error) {
        this.react('❌');
        this.reply(CRBTError(`\`\`\`\n${error}\`\`\``, `Error!!!!!1 :(`));
      }
    }
  },
});

const clean = async (text) => {
  // If our input is a promise, await it before continuing
  if (text && text.constructor.name == 'Promise') text = await text;

  // If the response isn't a string, `util.inspect()`
  // is used to 'stringify' the code in a safe way that
  // won't error out on objects with circular references
  // (like Collections, for example)
  if (typeof text !== 'string') text = inspect(text, { depth: 1 });

  // Replace symbols with character code alternatives
  text = text
    .replace(/`/g, '`' + String.fromCharCode(8203))
    .replace(/@/g, '@' + String.fromCharCode(8203));

  // Send off the cleaned up result
  return text;
};
