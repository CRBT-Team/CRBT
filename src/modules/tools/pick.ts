import { getColor } from '$lib/functions/getColor';
import { MessageEmbed } from 'discord.js';
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

    const e = new MessageEmbed()
      .setTitle(`"${randomValue.trim()}" was picked from the ${valuesArray.length} values.`)
      .setColor(await getColor(this.user));
    if (comment) e.setAuthor({ name: `Comment: "${comment}"` });

    await this.reply({
      embeds: [e],
    });
  },
});
