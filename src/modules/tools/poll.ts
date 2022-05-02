import { colors, db, emojis, icons } from '$lib/db';
import { CooldownError, CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { ms } from '$lib/functions/ms';
import { setLongerTimeout } from '$lib/functions/setLongerTimeout';
import { polls } from '@prisma/client';
import dayjs from 'dayjs';
import { GuildMember, MessageButton, MessageEmbed, Snowflake } from 'discord.js';
import {
  ButtonComponent,
  ChatCommand,
  components,
  OptionBuilder,
  row,
  SelectMenuComponent,
} from 'purplet';

export interface Poll {
  id: string;
  creatorId: string;
  choices: String[][];
}

const usersOnCooldown = new Map();

export default ChatCommand({
  name: 'poll',
  description: 'Create a poll with the given choices.',
  options: new OptionBuilder()
    .string('title', "What's your poll about?", true)
    .enum(
      'end_date',
      'When the poll should end.',
      [
        { name: 'In 20 minutes', value: '20m' },
        { name: 'In 1 hour', value: '1h' },
        { name: 'In 24 hours', value: '24h' },
        { name: 'In 1 week', value: '1w' },
      ],
      true
    )
    .string('choice1', 'The first choice a user can chose. Make it short preferably.', true)
    .string('choice2', 'An other choice a user can choose.', true)
    .string('choice3', 'Same as choice 1 and 2, not required.')
    .string('choice4', "Yup it's still the same idea.")
    .string('choice5', 'Again, same deal.')
    .string('choice6', 'Yet another choice someone can choose.')
    .string('choice7', 'Yes that is another choice.')
    .string('choice8', 'Still 3 more optional choices to go.')
    .string('choice9', 'We are almost at the choice limit!')
    .string(
      'choice10',
      "And the last choice you can add to your poll. Phew, what a complicated poll you're making."
    ),
  async handle({ title, end_date, ...choices }) {
    if (this.channel.type === 'DM') {
      return this.reply(CRBTError('This command cannot be used in DMs'));
    }

    const pollChoices: string[] = Object.values(choices).filter(Boolean);

    const msg = await this.channel.send({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: 'New Poll',
          })
          .setTitle(title)
          .setDescription(
            'Vote by clicking an choice below this message!' +
              `\nEnds <t:${dayjs().add(ms(end_date)).unix()}:R>`
          )
          .addFields(
            pollChoices.map((choices) => ({
              name: choices,
              value: `${emojis.progress.empty.repeat(10)}\n(0% - 0 votes)`,
            }))
          )
          .setFooter({ text: 'Total votes: 0' })
          .setColor(`#${colors.default}`),
      ],
      components:
        pollChoices.length <= 3
          ? components(
              row()
                .addComponents(
                  pollChoices.map((choice, index) => {
                    return new PollButton({ choiceId: index.toString() })
                      .setLabel(choice)
                      .setStyle(
                        choice.toLowerCase() === 'yes'
                          ? 'SUCCESS'
                          : choice.toLowerCase() === 'no'
                          ? 'DANGER'
                          : 'PRIMARY'
                      );
                  })
                )
                .addComponents(
                  new EditPollButton(this.user.id).setEmoji(emojis.pencil).setStyle('SECONDARY')
                )
            )
          : components(
              row(
                new PollSelector()
                  .setPlaceholder('Vote')
                  .addOptions(
                    pollChoices.map((choices, index) => {
                      return {
                        label: choices,
                        value: index.toString(),
                      };
                    })
                  )
                  .setMinValues(0)
                  .setMaxValues(1)
              ),
              row(new EditPollButton(this.user.id).setEmoji(emojis.pencil).setStyle('SECONDARY'))
            ),
    });

    const pollData = await db.polls.create({
      data: {
        id: `${this.channel.id}/${msg.id}`,
        creatorId: this.user.id,
        choices: JSON.stringify(pollChoices.map((_) => [])),
      },
    });

    this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            iconURL: icons.success,
            name: 'Poll created!',
          })
          .setDescription(
            `People can now vote on your poll using the options given below.\n` +
              `The poll will end <t:${dayjs()
                .add(ms(end_date))
                .unix()}:R>, but you can end it prematurely using the "End Poll" button.`
          )
          .setColor(`#${colors.success}`),
      ],
      ephemeral: true,
    });

    setLongerTimeout(async () => {
      await db.polls.delete({
        where: { id: pollData.id },
      });

      const fetchMsg = await this.channel.messages.fetch(msg.id);

      if (!fetchMsg) return;

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
              } out of ${totalVotes}!\nClick the button below to view the full results.`
            )
            .setColor(`#${colors.success}`),
        ],
        components: components(
          row(new MessageButton().setLabel('Jump to poll').setStyle('LINK').setURL(msg.url))
        ),
      });
    }, ms(end_date));
  },
});

export const PollButton = ButtonComponent({
  async handle({ choiceId }) {
    if (usersOnCooldown.has(this.user.id) && usersOnCooldown.get(this.user.id) > Date.now()) {
      return this.reply(await CooldownError(this, await usersOnCooldown.get(this.user.id), false));
    }

    const pollData = await db.polls.findFirst({
      where: { id: `${this.channel.id}/${this.message.id}` },
    });
    const poll = this.message.embeds[0] as MessageEmbed;

    const e = await renderPoll(choiceId, this.user.id, pollData, poll);

    this.update({
      embeds: [e],
    });
    usersOnCooldown.set(this.user.id, Date.now() + 3000);
  },
});

export const PollSelector = SelectMenuComponent({
  async handle(ctx: null) {
    if (usersOnCooldown.has(this.user.id) && usersOnCooldown.get(this.user.id) > Date.now()) {
      return this.reply(await CooldownError(this, await usersOnCooldown.get(this.user.id), false));
    }

    const pollData = await db.polls.findFirst({
      where: { id: `${this.channel.id}/${this.message.id}` },
    });
    const poll = this.message.embeds[0] as MessageEmbed;

    const e = await renderPoll(this.values[0], this.user.id, pollData, poll);

    this.update({
      embeds: [e],
    });

    usersOnCooldown.set(this.user.id, Date.now() + 3000);
  },
});

export const EditPollButton = ButtonComponent({
  async handle(creatorId: string) {
    const creatorOptions = row(
      new EndPollButton(this.message.id).setLabel('End Poll').setStyle('DANGER'),
      new CancelPollButton(this.message.id)
        .setLabel('Delete Poll')
        .setStyle('DANGER')
        .setEmoji(emojis.trash_bin)
    );

    if (
      this.user.id !== creatorId &&
      !(this.member as GuildMember).permissions.has('MANAGE_MESSAGES')
    ) {
      return this.reply(
        CRBTError('Only moderators & the original post creator can edit this poll.')
      );
    }

    this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: 'Edit Poll',
          })
          .setColor(await getColor(this.user)),
      ],
      components: components(creatorOptions),
      ephemeral: true,
    });
  },
});

export const CancelPollButton = ButtonComponent({
  async handle(msgId: string) {
    await db.polls.delete({
      where: { id: `${this.channel.id}/${msgId}` },
    });

    await this.reply({
      content: `${emojis.success} Poll deleted.`,
      ephemeral: true,
    });
    const msg = await this.channel.messages.fetch(msgId);
    await msg.delete();
  },
});

export const EndPollButton = ButtonComponent({
  async handle(msgId: string) {
    await db.polls.delete({
      where: { id: `${this.channel.id}/${msgId}` },
    });

    const msg = await this.channel.messages.fetch(msgId);
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

    await this.followUp({
      embeds: [
        new MessageEmbed()
          .setTitle('🎉 The results are in!')
          .setDescription(
            `"**${ranking[0].name}**" has won with ${ranking[0].votes} ${
              ranking[0].votes === 1 ? 'vote' : 'votes'
            } out of ${totalVotes}!\nClick the button below to view the full results.`
          )
          .setColor(`#${colors.success}`),
      ],
      components: components(
        row(new MessageButton().setLabel('Jump to poll').setStyle('LINK').setURL(msg.url))
      ),
    });
  },
});

const renderPoll = async (
  choiceId: string,
  userId: Snowflake,
  pollData: polls,
  pollEmbed: MessageEmbed
) => {
  const choices: string[][] = JSON.parse(pollData.choices);
  const newChoiceId = Number(choiceId);
  const previousChoiceId = choices.findIndex((choice) => choice.find((voter) => voter === userId));

  if (previousChoiceId !== -1) {
    choices[previousChoiceId]?.splice(
      choices[previousChoiceId].findIndex((voter) => voter === userId),
      1
    );
  }
  if (previousChoiceId !== newChoiceId) {
    choices[newChoiceId]?.push(userId);
  }

  await db.polls.update({
    where: { id: pollData.id },
    data: { choices: JSON.stringify(choices) },
  });

  const totalVotes = choices.flat().length;

  pollEmbed.fields.forEach((choice, id) => {
    const votes = choices[id].length;
    let percentage = Math.round((votes / totalVotes) * 100);
    if (isNaN(percentage)) percentage = 0;
    if (percentage === Infinity) percentage = 100;

    choice.value = `${
      emojis.progress.fill.repeat(Math.round(percentage / 10)) +
      emojis.progress.empty.repeat(10 - Math.round(percentage / 10))
    }\n${percentage}% - ${votes} ${votes === 1 ? 'vote' : 'votes'}`;
  });
  pollEmbed.footer.text = `Total votes: ${totalVotes} - Poll ID: ${pollData.id.split('/')[1]}`;

  return pollEmbed;
};
