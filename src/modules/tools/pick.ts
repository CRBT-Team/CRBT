import { getColor } from '$lib/functions/getColor';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'pick',
  description: 'Pick an item at random from a given list.',
  options: new OptionBuilder()
    .string('values', 'The values to pick from, seperated by commas.', { required: true })
    .string('comment', 'The comment to display when picking.'),
  async handle({ values, comment }) {
    const valuesArray = values.split(',');
    const randomIndex = Math.floor(Math.random() * valuesArray.length);
    const randomValue = valuesArray[randomIndex];

    await this.reply({
      embeds: [
        {
          ...(comment ? { author: { name: `"${comment}"` } } : {}),
          title: `"${randomValue.trim()}" was picked from the ${valuesArray.length} values.`,
          color: await getColor(this.user),
        },
      ],
    });
  },
});
