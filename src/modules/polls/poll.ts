import { colors, db, emojis, icons } from '$lib/db';
import { CooldownError, CRBTError } from '$lib/functions/CRBTError';
import { findEmojis } from '$lib/functions/findEmojis';
import { getColor } from '$lib/functions/getColor';
import { ms } from '$lib/functions/ms';
import { setLongerTimeout } from '$lib/functions/setLongerTimeout';
import { showModal } from '$lib/functions/showModal';
import { trimArray } from '$lib/functions/trimArray';
import { getStrings } from '$lib/language';
import { EmojiRegex } from '$lib/util/regex';
import { polls } from '@prisma/client';
import dayjs from 'dayjs';
import {
  GuildMember,
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  Modal,
  TextInputComponent,
} from 'discord.js';
import {
  ButtonComponent,
  ChatCommand,
  components,
  OptionBuilder,
  row,
  SelectMenuComponent,
} from 'purplet';

const activePolls = new Map<string, polls>();
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
    .string('choice4', "And that's how far choices can go."),
  async handle({ title, end_date, ...choices }) {
    const { GUILD_ONLY } = getStrings(this.locale).globalErrors;
    const { errors } = getStrings(this.locale).poll;
    const { strings } = getStrings(this.guildLocale).poll;
    const { strings: userStrings } = getStrings(this.locale).poll;

    if (this.channel.type === 'DM') {
      return this.reply(CRBTError(GUILD_ONLY));
    }

    if (title.length > 100) {
      return this.reply(CRBTError(errors.TITLE_TOO_LONG));
    }

    const pollChoices: string[] = Object.values(choices).filter(Boolean);

    for (const choice of pollChoices) {
      if (choice.replace(EmojiRegex, '').length > 20) {
        return this.reply(CRBTError(errors.CHOICE_TOO_LONG));
      } else if (choice.replace(EmojiRegex, '').length === 0) {
        return this.reply(CRBTError(errors.CHOICE_EMPTY));
      }
    }

    const msg = await this.channel.send({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: `${strings.POLL_HEADER} • ${strings.POLL_HEADER_VOTE}`,
          })
          .setTitle(title)
          .setDescription(
            strings.POLL_DESCRIPTION.replace(
              '<TIME>',
              `<t:${dayjs().add(ms(end_date)).unix()}:R>`
            ).replace('<ICON>', emojis.menu)
          )
          .addFields(
            pollChoices.map((choice) => ({
              name: choice,
              value: `${emojis.progress.emptystart}${emojis.progress.empty.repeat(8)}${
                emojis.progress.emptyend
              }\n${strings.POLL_OPTION_RESULT.replace('<PERCENTAGE>', '0').replace(
                '<VOTES>',
                '0'
              )}`,
            }))
          )
          .setFooter({
            text: `${strings.POLL_FOOTER_VOTES.replace(
              '<VOTES>',
              '0'
            )} • ${strings.POLL_FOOTER_CREATOR.replace('<USER>', this.user.tag)}`,
          })
          .setColor(`#${colors.default}`),
      ],
      components:
        pollChoices.length <= 3
          ? components(
              row()
                .addComponents(
                  pollChoices.map((choice, index) => {
                    const choiceEmoji = findEmojis(choice)[0] || null;
                    const choiceText = choice.replace(EmojiRegex, '');

                    return new PollButton({ choiceId: index.toString() })
                      .setLabel(choiceText)
                      .setStyle(
                        choiceText.toLowerCase() === strings.KEYWORD_YES__KEEP_LOWERCASE
                          ? 'SUCCESS'
                          : choiceText.toLowerCase() === strings.KEYWORD_NO__KEEP_LOWERCASE
                          ? 'DANGER'
                          : 'PRIMARY'
                      )
                      .setEmoji(choiceEmoji);
                  })
                )
                .addComponents(
                  new PollOptionsButton(this.user.id)
                    .setEmoji(emojis.buttons.menu)
                    .setStyle('SECONDARY')
                )
            )
          : components(
              row(
                new PollSelector()
                  .setPlaceholder(strings.POLL_SELECT_MENU_VOTE)
                  .addOptions(
                    pollChoices.map((choice, index) => {
                      const choiceEmoji = findEmojis(choice)[0] || null;
                      const choiceText = choice.replace(EmojiRegex, '');
                      return {
                        label: choiceText,
                        value: index.toString(),
                        emoji: choiceEmoji,
                      };
                    })
                  )
                  .setMinValues(0)
                  .setMaxValues(1)
              ),
              row(
                new PollOptionsButton(this.user.id)
                  .setEmoji(emojis.buttons.menu)
                  .setStyle('SECONDARY')
              )
            ),
    });

    const pollData = await db.polls.create({
      data: {
        id: `${this.channel.id}/${msg.id}`,
        creatorId: this.user.id,
        choices: JSON.stringify(pollChoices.map((_) => [])),
      },
    });

    activePolls.set(pollData.id, pollData);

    this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            iconURL: icons.success,
            name: userStrings.SUCCESS_TITLE,
          })
          .setDescription(
            userStrings.SUCCESS_DESCRIPTION.replace(
              '<TIME>',
              `<t:${dayjs().add(ms(end_date)).unix()}:R>`
            ).replace('<ICON>', emojis.menu)
          )
          .setColor(`#${colors.success}`),
      ],
      ephemeral: true,
    });

    setLongerTimeout(async () => {
      const fetchMsg = await this.channel.messages.fetch(msg.id);

      if (!fetchMsg) return;

      endPoll(pollData, fetchMsg, this.guildLocale);
    }, ms(end_date));
  },
});

export const PollButton = ButtonComponent({
  async handle({ choiceId }) {
    if (usersOnCooldown.has(this.user.id) && usersOnCooldown.get(this.user.id) > Date.now()) {
      return this.reply(await CooldownError(this, await usersOnCooldown.get(this.user.id), false));
    }

    const pollData =
      activePolls.get(`${this.channel.id}/${this.message.id}`) ??
      (await db.polls.findFirst({
        where: { id: `${this.channel.id}/${this.message.id}` },
      }));
    const poll = this.message.embeds[0] as MessageEmbed;

    const e = await renderPoll(choiceId, this.user.id, pollData, poll, this.guildLocale);

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

    const pollData =
      activePolls.get(`${this.channel.id}/${this.message.id}`) ??
      (await db.polls.findFirst({
        where: { id: `${this.channel.id}/${this.message.id}` },
      }));
    const poll = this.message.embeds[0] as MessageEmbed;

    this.update({
      embeds: [await renderPoll(this.values[0], this.user.id, pollData, poll, this.guildLocale)],
    });

    usersOnCooldown.set(this.user.id, Date.now() + 3000);
  },
});

export const PollOptionsButton = ButtonComponent({
  async handle(creatorId: string) {
    const { strings, errors } = getStrings(this.locale).poll;

    if (
      this.user.id !== creatorId &&
      !(this.member as GuildMember).permissions.has('MANAGE_MESSAGES')
    ) {
      return this.reply(CRBTError(errors.POLL_DATA_NOT_ALLOWED));
    }

    const pollData =
      activePolls.get(`${this.channel.id}/${this.message.id}`) ??
      (await db.polls.findFirst({
        where: { id: `${this.channel.id}/${this.message.id}` },
      }));

    const choicesNames = this.message.embeds[0].fields.map(({ name }) => name);
    const choices: string[][] = JSON.parse(pollData.choices);

    this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: strings.POLL_DATA_OPTIONS,
          })
          .setFields(
            choices.map((choice, index) => ({
              name: `${choicesNames[index]} (${choice.length})`,
              value:
                choice.length > 0
                  ? trimArray(
                      choice.map((id) => `<@${id}>`),
                      15
                    ).join(', ')
                  : strings.POLL_DATA_NOVOTES,
            }))
          )
          .setFooter({
            text: strings.POLL_DATA_FOOTER,
          })
          .setColor(await getColor(this.user)),
      ],
      components: components(
        row(
          new EditPollButton(this.message.id)
            .setLabel(strings.BUTTON_EDIT_POLL)
            .setEmoji(emojis.buttons.pencil)
            .setStyle('SECONDARY'),
          new EndPollButton(this.message.id)
            .setLabel(strings.BUTTON_END_POLL)
            .setStyle('DANGER')
            .setEmoji(emojis.buttons.cross),
          new CancelPollButton(this.message.id)
            .setLabel(strings.BUTTON_CANCEL_POLL)
            .setStyle('DANGER')
            .setEmoji(emojis.buttons.trash_bin)
        )
      ),
      ephemeral: true,
    });
  },
});

export const EditPollButton = ButtonComponent({
  async handle(msgId: string) {
    const { strings } = getStrings(this.locale).poll;
    const msg = (await this.channel.messages.fetch(msgId)).embeds[0];

    const modal = new Modal()
      .setTitle(strings.BUTTON_EDIT_POLL)
      .setCustomId(`poll_${msgId}`)
      .setComponents(
        //@ts-ignore
        new MessageActionRow().setComponents(
          new TextInputComponent()
            .setCustomId('poll_title')
            .setLabel(strings.TITLE)
            .setMaxLength(100)
            .setValue(msg.title)
            .setRequired(true)
            .setStyle('PARAGRAPH')
        ),
        ...msg.fields.map((field, index) =>
          new MessageActionRow().setComponents(
            new TextInputComponent()
              .setCustomId(`poll_option_${index}`)
              .setLabel(`${strings.CHOICE} ${index + 1}`)
              .setValue(field.name)
              .setRequired(true)
              .setMaxLength(20)
              .setStyle('SHORT')
          )
        )
      );

    await showModal(modal, this);
    // const msg = await this.channel.messages.fetch(msgId);
    // const polLData = await db.polls.findFirst({
    //   where: { id: `${this.channel.id}/${msgId}` },
    // });
    // msg.edit({
    // })
  },
});

export const CancelPollButton = ButtonComponent({
  async handle(msgId: string) {
    const { strings } = getStrings(this.locale).poll;

    await db.polls.delete({
      where: { id: `${this.channel.id}/${msgId}` },
    });

    await this.update({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            iconURL: icons.success,
            name: strings.SUCCESS_POLL_DELETED,
          })
          .setColor(`#${colors.success}`),
      ],
      components: [],
    });
    const msg = await this.channel.messages.fetch(msgId);
    await msg.delete();
  },
});

export const EndPollButton = ButtonComponent({
  async handle(msgId: string) {
    const { strings } = getStrings(this.locale).poll;

    const pollData =
      activePolls.get(`${this.channel.id}/${msgId}`) ??
      (await db.polls.findFirst({
        where: { id: `${this.channel.id}/${msgId}` },
      }));

    const msg = await this.channel.messages.fetch(msgId);

    await endPoll(pollData, msg, this.guildLocale);

    await this.update({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            iconURL: icons.success,
            name: strings.SUCCESS_POLL_ENDED,
          })
          .setColor(`#${colors.success}`),
      ],
      components: [],
    });
  },
});

const endPoll = async (pollData: polls, pollMsg: Message, locale: string) => {
  const { strings } = getStrings(locale).poll;

  await db.polls.delete({
    where: { id: `${pollMsg.channel.id}/${pollMsg.id}` },
  });

  await pollMsg.edit({
    embeds: [
      new MessageEmbed({
        ...pollMsg.embeds[0],
        author: {
          name: `${strings.POLL_HEADER} • ${strings.POLL_HEADER_ENDED}`,
        },
        description: strings.POLL_DESCRIPTION_ENDED,
      }).setColor(`#${colors.gray}`),
    ],
    components: [],
  });

  const choices: string[][] = JSON.parse(pollData.choices);
  const totalVotes = choices.flat().length;
  const ranking = choices
    .map((choice, index) => {
      const votes = choice.length;
      return { name: pollMsg.embeds[0].fields[index].name, votes };
    })
    .sort((a, b) => b.votes - a.votes);

  await pollMsg.reply({
    embeds: [
      new MessageEmbed()
        .setTitle(`🎉 ${strings.POLL_RESULTS_TITLE}`)
        .setDescription(
          (ranking[0].votes === ranking[1].votes
            ? strings.POLL_RESULTS_DESCRIPTION_TIE.replace('<OPTION1>', ranking[0].name)
                .replace('<OPTION2>', ranking[1].name)
                .replace('<VOTES>', ranking[0].votes.toString())
            : strings.POLL_RESULTS_DESCRIPTION_WIN.replace(
                '<OPTION>',
                totalVotes.toString()
              ).replace('<VOTES>', ranking[0].votes.toString())) +
            ' ' +
            strings.POLL_RESULTS_DESCRIPTION_REST.replace('<TOTAL>', totalVotes.toString())
        )
        .setColor(`#${colors.success}`),
    ],
    components: components(
      row(
        new MessageButton()
          .setLabel(strings.BUTTON_JUMP_TO_POLL)
          .setStyle('LINK')
          .setURL(pollMsg.url)
      )
    ),
  });
};

const renderPoll = async (
  choiceId: string,
  userId: string,
  pollData: polls,
  pollEmbed: MessageEmbed,
  locale: string
) => {
  const { strings } = getStrings(locale).poll;

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

  const newData = await db.polls.update({
    where: { id: pollData.id },
    data: { choices: JSON.stringify(choices) },
  });

  activePolls.set(pollData.id, newData);

  const totalVotes = choices.flat().length;

  pollEmbed.fields.forEach((choice, id) => {
    const votes = choices[id].length;
    let percentage = Math.round((votes / totalVotes) * 100);
    if (isNaN(percentage)) percentage = 0;
    if (percentage === Infinity) percentage = 100;

    const progressBar = (
      `${emojis.progress.fill}.`.repeat(Math.round(percentage / 10)) +
      `${emojis.progress.empty}.`.repeat(10 - Math.round(percentage / 10))
    )
      .split('.')
      .map((e, i) => {
        if (i === 0) {
          if (e === emojis.progress.empty) {
            return emojis.progress.emptystart;
          } else if (e === emojis.progress.fill) {
            return emojis.progress.fillstart;
          }
        } else if (i === 9) {
          if (e === emojis.progress.empty) {
            return emojis.progress.emptyend;
          } else if (e === emojis.progress.fill) {
            return emojis.progress.fillend;
          }
        } else {
          return e;
        }
      })
      .join('')
      .replace(`${emojis.progress.fillstart}${emojis.progress.empty}`, emojis.progress.fillstartcut)
      .replace(`${emojis.progress.fill}${emojis.progress.empty}`, emojis.progress.fillcut);

    choice.value = `${progressBar}\n${strings.POLL_OPTION_RESULT.replace(
      '<PERCENTAGE>',
      percentage.toString()
    ).replace('<VOTES>', votes.toString())}`;
  });
  pollEmbed.footer.text = `${strings.POLL_FOOTER_VOTES.replace(
    '<VOTES>',
    totalVotes.toString()
  )} • ${pollEmbed.footer.text.split(' • ').slice(1)}`;

  return pollEmbed;
};
