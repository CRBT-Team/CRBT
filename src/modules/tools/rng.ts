import { getColor } from '$lib/functions/getColor';
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

    await this.reply({
      embeds: [
        {
          ...(comment ? { author: { name: `"${comment}"` } } : {}),
          title: `From ${minNum} to ${maxNum}: __${num}__`,
          color: await getColor(this.user),
        },
      ],
    });
  },
});
