import { colors, db, emojis, illustrations } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { ms } from '$lib/functions/ms';
import { setLongerTimeout } from '$lib/functions/setLongerTimeout';
import dayjs from 'dayjs';
import { MessageButton, MessageEmbed } from 'discord.js';
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
  description: 'Create a poll with the given options.',
  options: new OptionBuilder()
    .string('title', "What's your poll about?", true)
    .channel('channel', 'The channel to send the poll in.', true)
    .enum(
      'end_date',
      'When the poll should end.',
      [
        { name: 'Never, end it manually', value: 'never' },
        { name: 'In 5 seconds (for debugging)', value: '5s' },
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
    if (this.channel.type === 'DM') {
      return this.reply(CRBTError('This command cannot be used in DMs'));
    }

    const pollOptions = Object.values(options).filter((option) => option);

    if (!channel.isText()) {
      return this.reply(CRBTError('You can only create polls in text-based channels.'));
    }

    const msg = await channel.send({
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

    msg.edit({
      embeds: [{ ...msg.embeds[0], footer: { text: `Total votes: 0 - ${msg.id}` } }],
    });

    await db.polls.create({
      data: {
        id: `${channel.id}/${msg.id}`,
        voters: [],
      },
    });

    this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            iconURL: illustrations.success,
            name: 'Poll created!',
          })
          .setDescription(
            `People can now vote on your poll, that has been sent in ${channel}.` +
              (end_date !== 'never'
                ? `The poll will end <t:${dayjs(
                    end_date
                  ).unix()}:R>\nYou can end it prematurely using \`/poll end id:${
                    msg.id
                  }\` within ${channel}.`
                : `To end it, use \`/poll end id:${msg.id}\` in ${channel}.`)
          )
          .setColor(`#${colors.success}`),
      ],
      ephemeral: true,
    });

    if (end_date !== 'never') {
      setLongerTimeout(async () => {
        const pollData = await db.polls.findFirst({
          where: { id: `${channel.id}/${msg.id}` },
        });

        if (pollData) {
          await db.polls.delete({
            where: { id: `${channel.id}/${msg.id}` },
          });

          await msg.edit({
            embeds: [
              new MessageEmbed({
                ...msg.embeds[0],
                author: {
                  name: 'Poll ended',
                },
                description: 'The poll has ended. You can no longer vote on it.',
              }),
            ],
            components: [],
          });

          const totalVotes = Number(msg.embeds[0].footer.text.split(' ')[2]);
          const ranking = msg.embeds[0].fields
            .map(({ name, value }) => {
              const votes = parseInt(value.split(' - ')[1].split(' ')[0]);
              return { name, votes };
            })
            .sort((a, b) => b.votes - a.votes);

          await msg.reply({
            embeds: [
              new MessageEmbed()
                .setTitle('🎉 The results are in!')
                .setDescription(
                  `"**${ranking[0].name}**" has won with ${ranking[0].votes} ${
                    ranking[0].votes === 1 ? 'vote' : 'votes'
                  } out of ${totalVotes}!`
                )
                .setColor(`#${colors.success}`),
            ],
            components: components(
              row(new MessageButton().setLabel('Jump to poll').setStyle('LINK').setURL(msg.url))
            ),
          });
        }
      }, ms(end_date));
    }
  },
});

export const PollButton = ButtonComponent({
  async handle({ optionId }: { optionId: number }) {
    const pollData = await db.polls.findFirst({
      where: { id: `${this.channel.id}/${this.message.id}` },
    });

    const userVote = pollData.voters.find((voter: any) => voter.user_id === this.user.id) as any;

    if (userVote) {
      userVote.option_id = optionId;
    } else {
      pollData.voters.push({
        user_id: this.user.id,
        option_id: optionId,
      });
    }

    await db.polls.update({
      where: { id: `${this.channel.id}/${this.message.id}` },
      data: { voters: pollData.voters },
    });

    const poll = this.message.embeds[0] as MessageEmbed;
    const totalVotes = pollData.voters.length;
    poll.fields.forEach((option, index) => {
      // from the pollData, rerender the poll
      const votes = pollData.voters.filter((voter: any) => voter.option_id === index).length;
      const percentage = Math.round((votes / totalVotes) * 100);

      poll.fields[index].value = `${
        // render a progress bar where the percentage is the length of the bar in emojis
        emojis.progress.fill.repeat(Math.round(percentage / 10)) +
        emojis.progress.empty.repeat(10 - Math.round(percentage / 10))
      }\n${percentage}% - ${votes} ${votes === 1 ? 'vote' : 'votes'}`;
    });
    poll.footer.text = `Total votes: ${totalVotes} - Poll ID: ${this.message.id}`;

    this.update({
      embeds: [poll],
    });
  },
});

export const PollSelector = SelectMenuComponent({
  async handle(ctx: null) {
    const pollData = await db.polls.findFirst({
      where: { id: `${this.channel.id}/${this.message.id}` },
    });

    const userVote = pollData.voters.find((voter: any) => voter.user_id === this.user.id) as any;

    if (userVote) {
      userVote.option_id = this.values[0];
    } else {
      pollData.voters.push({
        user_id: this.user.id,
        option_id: this.values[0],
      });
    }

    await db.polls.update({
      where: { id: `${this.channel.id}/${this.message.id}` },
      data: { voters: pollData.voters },
    });

    const poll = this.message.embeds[0] as MessageEmbed;
    const totalVotes = pollData.voters.length;
    poll.fields.forEach((option, index) => {
      // from the pollData, rerender the poll
      const votes = pollData.voters.filter((voter: any) => voter.option_id === index).length;
      const percentage = Math.round((votes / totalVotes) * 100);

      poll.fields[index].value = `${
        // render a progress bar where the percentage is the length of the bar in emojis
        emojis.progress.fill.repeat(Math.round(percentage / 10)) +
        emojis.progress.empty.repeat(10 - Math.round(percentage / 10))
      }\n${percentage}% - ${votes} ${votes === 1 ? 'vote' : 'votes'}`;
    });
    poll.footer.text = `Total votes: ${totalVotes} - Poll ID: ${this.message.id}`;

    this.update({
      embeds: [poll],
    });
  },
});
