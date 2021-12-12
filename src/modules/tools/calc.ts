import { CRBTError } from '$lib/functions/CRBTError';
import { getVar } from '$lib/functions/getVar';
import { MessageEmbed } from 'discord.js';
import { Parser } from 'expr-eval';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'calc',
  description: 'Calculates a given expression.',
  options: new OptionBuilder().string('expr', 'The expression to calculate.', true),
  async handle({ expr }) {
    const math = new Parser();
    try {
      const result = math.evaluate(expr);
      await this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor(expr)
            .setTitle(`= ${result}`)
            .setColor(await getVar('color', this.user.id)),
        ],
      });
    } catch (error) {
      await this.reply(CRBTError('custom', String(error)));
    }
  },
});
