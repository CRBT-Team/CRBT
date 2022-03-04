import { colors, emojis } from '$lib/db';
import { ms } from '$lib/functions/ms';
import { setLongerTimeout } from '$lib/functions/setLongerTimeout';
import dayjs from 'dayjs';
import { MessageEmbed } from 'discord.js';
import {
  ButtonComponent,
  ChatCommand,
  components,
  OptionBuilder,
  row,
  SelectMenuComponent,
} from 'purplet';

export default ChatCommand({
  name: 'poll start',
  description: 'Creates a poll with the given options.',
  options: new OptionBuilder()
    .string('title', "What's your poll about?", true)
    .channel('channel', 'The channel to send the poll in.', true)
    .enum(
      'end_date',
      'When the poll should end.',
      [
        { name: 'Never, end it manually', value: 'never' },
        { name: 'In 1 hour', value: '1h' },
        { name: 'In 24 hours', value: '24h' },
        { name: 'In 1 week', value: '1w' },
      ],
      true
    )
    .string('option1', 'The first option a user can chose. Make it short preferably.', true)
    .string('option2', 'An other option a user can choose.', true)
    .string('option3', 'Same as option 1 and 2, not required.')
    .string('option4', "Yup it's still the same idea.")
    .string('option5', 'Again, same deal.')
    .string('option6', 'Yet another option someone can choose.')
    .string('option7', 'Yes that is another option.')
    .string('option8', 'Still 3 more optional options to go.')
    .string('option9', 'We are almost at the option limit!')
    .string(
      'option10',
      "And the last option you can add to your poll. Phew, what a complicated poll you're making."
    ),
  async handle({ title, channel, end_date, ...options }) {
    const pollOptions = Object.values(options).filter((option) => option);

    await this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: 'New Poll',
          })
          .setTitle(title)
          .setDescription(
            'Vote by clicking an option below this message!' +
              (end_date !== 'never' ? `\nEnds <t:${dayjs().add(ms(end_date)).unix()}:R>` : '')
          )
          .addFields(
            pollOptions.map((option) => ({
              name: option,
              value: `${emojis.progress.empty.repeat(10)}\n(0% - 0 votes)`,
            }))
          )
          .setFooter({ text: 'Total votes: 0' })
          .setColor(`#${colors.default}`),
      ],
      components:
        pollOptions.length <= 3
          ? components(
              row().addComponents(
                pollOptions.map((option, index) => {
                  return new PollButton({ optionId: index }).setLabel(option).setStyle('PRIMARY');
                })
              )
            )
          : components(
              row(
                new PollSelector().setPlaceholder('Vote').addOptions(
                  pollOptions.map((option, index) => {
                    return {
                      label: option,
                      description: `Vote for "${option}".`,
                      value: index.toString(),
                    };
                  })
                )
              )
            ),
    });

    setLongerTimeout(() => {
      
    }, ms(end_date));
  },
});

export const PollButton = ButtonComponent({
  async handle({ optionId }: { optionId: number }) {
    const poll = this.message.embeds[0] as MessageEmbed;
    const totalVotes = Number(poll.footer.text.split(' ')[2]);
    poll.fields.forEach(({ name, value }, index) => {
      const votes = parseInt(value.split(' - ')[1].split(' ')[0]) + (index === optionId ? 1 : 0);
      const percentage = Math.round((votes / (totalVotes + 1)) * 100);

      poll.fields[index].value = `${
        // render a progress bar where the percentage is the length of the bar in emojis
        emojis.progress.fill.repeat(Math.round(percentage / 10)) +
        emojis.progress.empty.repeat(10 - Math.round(percentage / 10))
      }\n${percentage}% - ${votes} ${votes === 1 ? 'vote' : 'votes'}`;
    });
    poll.footer.text = `Total votes: ${totalVotes + 1}`;

    this.update({
      embeds: [poll],
    });
  },
});

export const PollSelector = SelectMenuComponent({
  async handle(ctx: null) {
    const poll = this.message.embeds[0] as MessageEmbed;
    const totalVotes = Number(poll.footer.text.split(' ')[2]);
    poll.fields.forEach(({ name, value }, index) => {
      const votes =
        parseInt(value.split(' - ')[1].split(' ')[0]) +
        (index === parseInt(this.values[0]) ? 1 : 0);
      const percentage = Math.round((votes / (totalVotes + 1)) * 100);

      poll.fields[index].value = `${
        // render a progress bar where the percentage is the length of the bar in emojis
        emojis.progress.fill.repeat(Math.round(percentage / 10)) +
        emojis.progress.empty.repeat(10 - Math.round(percentage / 10))
      }\n${percentage}% - ${votes} ${votes === 1 ? 'vote' : 'votes'}`;
    });
    poll.footer.text = `Total votes: ${totalVotes + 1}`;

    this.update({
      embeds: [poll],
    });
  },
});
