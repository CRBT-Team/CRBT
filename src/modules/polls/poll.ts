import { colors, db, emojis, icons } from '$lib/db';
import { CooldownError, CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { findEmojis } from '$lib/functions/findEmojis';
import { getColor } from '$lib/functions/getColor';
import { ms } from '$lib/functions/ms';
import { FullDBTimeout, setDbTimeout, TimeoutData } from '$lib/functions/setDbTimeout';
import { trimArray } from '$lib/functions/trimArray';
import { t } from '$lib/language';
import { EmojiRegex } from '$lib/util/regex';
import dayjs from 'dayjs';
import {
  GuildMember,
  Message,
  MessageButton,
  MessageEmbed,
  MessageSelectMenu,
  TextInputComponent,
} from 'discord.js';
import {
  ButtonComponent,
  ChatCommand,
  components,
  ModalComponent,
  OptionBuilder,
  row,
  SelectMenuComponent,
} from 'purplet';

const activePolls = new Map<string, FullDBTimeout<'POLL'>>();
const usersOnCooldown = new Map();

export default ChatCommand({
  name: 'poll',
  description: 'Create a poll with the given choices.',
  options: new OptionBuilder()
    .string('title', "What's your poll about?", { required: true })
    .string('end_date', 'When the poll should end.', {
      choices: {
        '30s': 'In 30 seconds (dev)',
        '20m': 'In 20 minutes',
        '1h': 'In an hour',
        '24h': 'In 24 hours',
        '1w': 'In a week',
      },
      required: true,
    })
    .string('choice1', 'The first choice a user can chose. Make it short preferably.', {
      required: true,
    })
    .string('choice2', 'An other choice a user can choose.', { required: true })
    .string('choice3', 'Same as choice 1 and 2, not required.')
    .string('choice4', "And that's how far choices can go."),
  async handle({ title, end_date, ...choices }) {
    const { GUILD_ONLY } = t(this, 'globalErrors');
    const { errors } = t(this, 'poll');
    const { strings } = t(this.guildLocale, 'poll');
    const { strings: userStrings } = t(this, 'poll');

    if (!this.guild) {
      return this.reply(CRBTError(GUILD_ONLY));
    }

    if (title.length > 100) {
      return this.reply(CRBTError(errors.TITLE_TOO_LONG));
    }

    const pollChoices: string[] = Object.values(choices).filter(Boolean);

    for (const choice of pollChoices) {
      if (choice.replace(EmojiRegex, '').length > 40) {
        return this.reply(CRBTError(errors.CHOICE_TOO_LONG));
      } else if (choice.replace(EmojiRegex, '').length === 0) {
        return this.reply(CRBTError(errors.CHOICE_EMPTY));
      }
    }

    const msg = await this.channel.send({
      embeds: [
        new MessageEmbed()
          // .setAuthor({
          //   name: `${strings.POLL_HEADER} • ${strings.POLL_HEADER_VOTE}`,
          // })
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

    const pollData = await setDbTimeout({
      id: `${this.channel.id}/${msg.id}`,
      type: 'POLL',
      expiration: new Date(Date.now() + ms(end_date)),
      locale: this.guildLocale,
      data: {
        creatorId: this.user.id,
        choices: pollChoices.map((_) => []),
      },
    });

    activePolls.set(`${this.channel.id}/${msg.id}`, pollData);

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
  },
});

async function getPollData(id: string) {
  return (
    activePolls.get(id) ??
    ((await db.timeouts.findFirst({
      where: { id },
    })) as FullDBTimeout<'POLL'>)
  );
}

export const PollButton = ButtonComponent({
  async handle({ choiceId }) {
    if (usersOnCooldown.has(this.user.id) && usersOnCooldown.get(this.user.id) > Date.now()) {
      return this.reply(await CooldownError(this, await usersOnCooldown.get(this.user.id), false));
    }

    const pollData = await getPollData(`${this.channel.id}/${this.message.id}`);
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

    const pollData = await getPollData(`${this.channel.id}/${this.message.id}`);
    const poll = this.message.embeds[0] as MessageEmbed;

    this.update({
      embeds: [await renderPoll(this.values[0], this.user.id, pollData, poll, this.guildLocale)],
    });

    usersOnCooldown.set(this.user.id, Date.now() + 3000);
  },
});

export const PollOptionsButton = ButtonComponent({
  async handle(creatorId: string) {
    const { strings, errors } = t(this, 'poll');

    if (
      this.user.id !== creatorId &&
      !(this.member as GuildMember).permissions.has('MANAGE_MESSAGES')
    ) {
      return this.reply(CRBTError(errors.POLL_DATA_NOT_ALLOWED));
    }

    const pollData = await getPollData(`${this.channel.id}/${this.message.id}`);
    const choicesNames = this.message.embeds[0].fields.map(({ name }) => name);
    const choices = pollData.data.choices;

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
    const { strings } = t(this, 'poll');
    const msg = (await this.channel.messages.fetch(msgId)).embeds[0];

    const modal = new EditPollModal(msgId).setTitle(strings.BUTTON_EDIT_POLL).setComponents(
      row(
        new TextInputComponent()
          .setCustomId('poll_title')
          .setLabel(strings.TITLE)
          .setMaxLength(100)
          .setValue(msg.title)
          .setRequired(true)
          .setStyle('PARAGRAPH')
      ),
      ...msg.fields.map((field, index) =>
        row(
          new TextInputComponent()
            .setCustomId(`poll_option_${index}`)
            .setLabel(`${strings.CHOICE} ${index + 1}`)
            .setValue(field.name)
            .setRequired(true)
            .setMaxLength(40)
            .setStyle('SHORT')
        )
      )
    );

    await this.showModal(modal);
  },
});

export const EditPollModal = ModalComponent({
  async handle(msgId: string) {
    const pollTitle = this.fields.getTextInputValue('poll_title');
    const choices = this.components.slice(1).map((_, i) => {
      return this.fields.getTextInputValue(`poll_option_${i}`);
    });

    const msg = await this.channel.messages.fetch(msgId);

    const isSelectMenu = msg.components.length > 1;

    if (isSelectMenu) {
      (msg.components[0].components[0] as MessageSelectMenu).options = (
        msg.components[0].components[0] as MessageSelectMenu
      ).options.map((option, i) => ({
        ...option,
        label: choices[i],
      }));
    }

    const Components = isSelectMenu
      ? components(row(msg.components[0].components[0]), msg.components[1])
      : components(
          row(
            //@ts-ignore
            msg.components[0].components.slice(0, -1).map((component, i) => ({
              ...component,
              label: choices[i],
            })),
            msg.components[0].components.at(-1)
          )
        );

    await msg.edit({
      embeds: [
        new MessageEmbed({
          ...msg.embeds[0],
          footer: {
            text: `${msg.embeds[0].footer.text.split(',')[0]}, edited `,
          },
        })
          .setTimestamp()
          .setTitle(pollTitle)
          .setFields(
            choices.map((choice, i) => ({
              name: choice,
              value: msg.embeds[0].fields[i].value,
            }))
          ),
      ],
      components: Components,
    });

    //@ts-ignore
    await this.update({});
  },
});

export const CancelPollButton = ButtonComponent({
  async handle(msgId: string) {
    const { strings } = t(this, 'poll');

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

    try {
      await db.timeouts.delete({
        where: { id: `${this.channel.id}/${msgId}` },
      });

      const msg = await this.channel.messages.fetch(msgId);
      await msg.delete();
    } catch (err) {
      UnknownError(this, err);
    }
  },
});

export const EndPollButton = ButtonComponent({
  async handle(msgId: string) {
    const { strings } = t(this, 'poll');

    const pollData = await getPollData(`${this.channel.id}/${msgId}`);

    if (pollData) {
      const msg = await this.channel.messages.fetch(msgId);
      await endPoll(pollData.data, msg, this.guildLocale);
    }

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

export const endPoll = async (pollData: TimeoutData['POLL'], pollMsg: Message, locale: string) => {
  const { strings } = t(locale, 'poll');

  const choices = pollData.choices;
  const totalVotes = choices.flat().length;
  const ranking = choices
    .map((choice, index) => {
      const votes = choice.length;
      return { name: pollMsg.embeds[0].fields[index].name, votes };
    })
    .sort((a, b) => b.votes - a.votes);
  const winners = ranking.filter((place) => place.votes === ranking[0].votes);

  await pollMsg.reply({
    embeds: [
      new MessageEmbed()
        .setTitle(`🎉 ${strings.POLL_RESULTS_TITLE}`)
        .setDescription(
          (winners.length > 1
            ? strings.POLL_RESULTS_DESCRIPTION_TIE.replace('<OPTION1>', ranking[0].name)
                .replace(
                  '<OPTION2>',
                  winners
                    .slice(1)
                    .map((winner) => winner.name)
                    .join(', ')
                )
                .replace('<VOTES>', ranking[0].votes.toString())
            : strings.POLL_RESULTS_DESCRIPTION_WIN.replace(
                '<OPTION>',
                `${ranking[0].name}`
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

  await pollMsg.edit({
    embeds: [
      new MessageEmbed({
        ...pollMsg.embeds[0],
        author: {
          name: `${strings.POLL_HEADER} • ${strings.POLL_HEADER_ENDED}`,
        },
        description: '',
      })
        .setFields(
          pollMsg.embeds[0].fields.map((field) => {
            if (winners.map(({ name }) => name).includes(field.name)) {
              return {
                name: `🏆 ${field.name}`,
                value: field.value,
              };
            }
            return field;
          })
        )
        .setColor(`#${colors.gray}`),
    ],
    components: [],
  });
};

const renderPoll = async (
  choiceId: string,
  userId: string,
  pollData: FullDBTimeout<'POLL'>,
  pollEmbed: MessageEmbed,
  locale: string
) => {
  const { strings } = t(locale, 'poll');

  const choices = pollData.data.choices;
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

  const newData = (await db.timeouts.update({
    where: { id: pollData.id },
    data: { data: { ...pollData.data, choices } },
  })) as FullDBTimeout<'POLL'>;

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
      .replace(`${emojis.progress.fill}${emojis.progress.empty}`, emojis.progress.fillcut)
      .replace(`${emojis.progress.fill}${emojis.progress.emptyend}`, emojis.progress.fillcut);

    choice.value = `${progressBar}\n${strings.POLL_OPTION_RESULT.replace(
      '<PERCENTAGE>',
      percentage.toString()
    ).replace('<VOTES>', votes.toString())}`;
  });
  pollEmbed.footer.text = `${strings.POLL_FOOTER_VOTES.replace(
    '<VOTES>',
    totalVotes.toString()
  )} • ${pollEmbed.footer.text.split(' • ').slice(1).join(' • ')}`;

  return pollEmbed;
};
