import { getColor } from '$lib/functions/getColor';
import { MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'rng',
  description: 'Picks a number at random from the given range, or from 1 to 100 if none is given.',
  options: new OptionBuilder()
    .number('min', 'The minimum number to pick. Defaults to 1.')
    .number('max', 'The maximum number to pick. Defaults to 100.')
    .string('comment', 'The comment to display when picking.'),
  async handle({ min, max, comment }) {
    const minNum = min ?? 1;
    const maxNum = max ?? 100;

    const num = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;

    const e = new MessageEmbed().setTitle(`= ${num}`).setColor(await getColor(this.user));
    if (comment) e.setAuthor(`Comment: "${comment}"`);

    await this.reply({
      embeds: [e],
    });
  },
});
