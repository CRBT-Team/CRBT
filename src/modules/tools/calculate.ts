import { UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { getStrings } from '$lib/language';
import { MessageEmbed } from 'discord.js';
import { Parser } from 'expr-eval';
import { ChatCommand, OptionBuilder } from 'purplet';

const { meta } = getStrings('en-US').calc;
const math = new Parser();

export default ChatCommand({
  ...meta,
  options: new OptionBuilder().string('expression', meta.options[0].description, true),
  async handle({ expression }) {
    try {
      const result = math.evaluate(expression);
      await this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({ name: expression })
            .setTitle(`= ${result}`)
            .setColor(await getColor(this.user)),
        ],
      });
    } catch (e) {
      await this.reply(UnknownError(this, String(e)));
    }
  },
});
