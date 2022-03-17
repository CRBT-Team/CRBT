import { getColor } from '$lib/functions/getColor';
import { MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'rng',
  description: 'Pick a number at random from the given range.',
  options: new OptionBuilder()
    .number('max', 'The maximum number to pick. Defaults to 100.')
    .number('min', 'The minimum number to pick. Defaults to 1.')
    .string('comment', 'The comment to display when picking.'),
  async handle({ min, max, comment }) {
    const minNum = min ?? 1;
    const maxNum = max ?? 100;

    const num = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;

    const e = new MessageEmbed()
      .setTitle(`From ${minNum} to ${maxNum}: __${num}__`)
      .setColor(await getColor(this.user));
    if (comment) e.setAuthor({ name: `Comment: "${comment}"` });

    await this.reply({
      embeds: [e],
    });
  },
});
