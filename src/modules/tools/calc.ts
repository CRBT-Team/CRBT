import { UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { languages } from '$lib/language';
import { MessageEmbed } from 'discord.js';
import { Parser } from 'expr-eval';
import { ChatCommand, OptionBuilder } from 'purplet';

const { meta } = languages['en-US'].calc;
const math = new Parser();

export default ChatCommand({
  ...meta,
  options: new OptionBuilder().string('expr', meta.options[0].description, true),
  async handle({ expr }) {
    try {
      const result = math.evaluate(expr);
      await this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({ name: expr })
            .setTitle(`= ${result}`)
            .setColor(await getColor(this.user)),
        ],
      });
    } catch (e) {
      await this.reply(UnknownError(this, String(e)));
    }
  },
});
