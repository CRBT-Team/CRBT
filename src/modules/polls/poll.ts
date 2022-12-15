import { timeAutocomplete } from '$lib/autocomplete/timeAutocomplete';
import { prisma } from '$lib/db';
import { colors, emojis } from '$lib/env';
import { CooldownError, CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { findEmojis } from '$lib/functions/findEmojis';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { localeLower } from '$lib/functions/localeLower';
import { isValidTime, ms } from '$lib/functions/ms';
import { progressBar } from '$lib/functions/progressBar';
import { trimArray } from '$lib/functions/trimArray';
import { getAllLanguages, t } from '$lib/language';
import { dbTimeout } from '$lib/timeouts/dbTimeout';
import { TimeoutTypes } from '$lib/types/timeouts';
import { Poll } from '@prisma/client';
import { CustomEmojiRegex, timestampMention } from '@purplet/utils';
import dayjs from 'dayjs';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { Message, MessageEmbed, TextInputComponent } from 'discord.js';
import {
  ButtonComponent,
  ChatCommand,
  components,
  ModalComponent,
  OptionBuilder,
  row,
} from 'purplet';

const activePolls = new Map<string, Poll>();
const usersOnCooldown = new Map();

const options = new OptionBuilder()
  .string('title', t('en-US', 'poll.meta.options.title.description'), {
    nameLocalizations: getAllLanguages('TITLE', localeLower),
    descriptionLocalizations: getAllLanguages('poll.meta.options.title.description'),
    required: true,
    minLength: 3,
    maxLength: 120,
  })
  .string('end_date', t('en-US', 'poll.meta.options.end_date.description'), {
    nameLocalizations: getAllLanguages('END_DATE', localeLower),
    descriptionLocalizations: getAllLanguages('poll.meta.options.end_date.description'),
    autocomplete({ end_date }) {
      return timeAutocomplete.call(this, end_date, '3w', '20m');
    },
    required: true,
  });

for (let i = 1; i <= 4; i++) {
  options.string(`choice${i}`, t('en-US', 'poll.meta.options.choice.description'), {
    nameLocalizations: getAllLanguages(
      'CHOICE',
      (str, locale) => `${str.toLocaleLowerCase(locale)}${i}`
    ),
    descriptionLocalizations: getAllLanguages('poll.meta.options.choice.description'),
    maxLength: 45,
    required: i <= 2,
  });
}

export default ChatCommand({
  name: 'poll',
  description: t('en-US', 'poll.meta.description'),
  nameLocalizations: getAllLanguages('POLL', localeLower),
  descriptionLocalizations: getAllLanguages('poll.meta.description'),
  allowInDMs: false,
  options,
  async handle({ title, end_date, ...choices }) {
    const { strings } = t(this.guildLocale, 'poll');
    const { errors, strings: userStrings } = t(this, 'poll');

    if (!isValidTime(end_date) && ms(end_date) > ms('3w')) {
      return CRBTError(this, 'Invalid duration or exceeds 3 weeks.');
    }

    await this.deferReply({
      ephemeral: true,
    });

    try {
      const pollChoices: string[] = Object.values(choices).filter(Boolean);

      for (const choice of pollChoices) {
        if (choice.replace(CustomEmojiRegex, '').trim().length === 0) {
          return CRBTError(this, errors.CHOICE_EMPTY);
        }
      }

      const msg = await this.channel.send({
        embeds: [
          new MessageEmbed()
            .setTitle(title)
            .setDescription(
              strings.POLL_DESCRIPTION.replace(
                '{TIME}',
                `<t:${dayjs().add(ms(end_date)).unix()}:R>`
              ).replace('{ICON}', emojis.menu)
            )
            .addFields(
              pollChoices.map((choice) => ({
                name: choice,
                value: `${emojis.progress.emptystart}${emojis.progress.empty.repeat(8)}${
                  emojis.progress.emptyend
                }\n${strings.POLL_OPTION_RESULT.replace('{PERCENTAGE}', '0').replace(
                  '{VOTES}',
                  '0'
                )}`,
              }))
            )
            .setFooter({
              text: `${strings.POLL_FOOTER_VOTES.replace(
                '{VOTES}',
                '0'
              )} • ${strings.POLL_FOOTER_CREATOR.replace('{USER}', this.user.tag)}`,
            })
            .setColor(await getColor(this.guild)),
        ],
        components: components(
          row()
            .addComponents(
              pollChoices.map((choice, index) => {
                const choiceEmoji = findEmojis(choice)[0] || null;
                const choiceText = choice.replace(CustomEmojiRegex, '');

                return new PollButton({ choiceId: index.toString() })
                  .setLabel(choiceText)
                  .setStyle(
                    choiceText.toLowerCase() === t(this, 'YES').toLocaleLowerCase(this.locale)
                      ? 'SUCCESS'
                      : choiceText.toLowerCase() === t(this, 'NO').toLocaleLowerCase(this.locale)
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
        ),
      });

      const pollData = await dbTimeout(TimeoutTypes.Poll, {
        id: `${this.channel.id}/${msg.id}`,
        expiresAt: new Date(Date.now() + ms(end_date)),
        locale: this.guildLocale,
        creatorId: this.user.id,
        serverId: this.guild.id,
        choices: pollChoices.map((_) => []),
      });

      activePolls.set(`${this.channel.id}/${msg.id}`, pollData);

      await this.editReply({
        embeds: [
          {
            title: `${emojis.success} ${userStrings.SUCCESS_TITLE}`,
            description: userStrings.SUCCESS_DESCRIPTION.replace(
              '{TIME}',
              timestampMention(Date.now() + ms(end_date), 'R')
            ).replace('{ICON}', emojis.menu),
            color: colors.success,
          },
        ],
      });
    } catch (error) {
      this.reply(UnknownError(this, String(error)));
    }
  },
});

async function getPollData(id: string) {
  return (
    activePolls.get(id) ??
    (await prisma.poll.findFirst({
      where: { id },
    }))
  );
}

export const PollButton = ButtonComponent({
  async handle({ choiceId }) {
    if (usersOnCooldown.has(this.user.id) && usersOnCooldown.get(this.user.id) > Date.now()) {
      return this.reply(await CooldownError(this, await usersOnCooldown.get(this.user.id), false));
    }

    const poll = await getPollData(`${this.channel.id}/${this.message.id}`);
    const pollEmbed = this.message.embeds[0] as MessageEmbed;

    const e = await renderPoll(choiceId, this.user.id, poll, pollEmbed);
    this.update({
      embeds: [e],
    });
    usersOnCooldown.set(this.user.id, Date.now() + 3000);
  },
});

export const PollOptionsButton = ButtonComponent({
  async handle(creatorId: string) {
    const { strings, errors } = t(this, 'poll');

    if (
      this.user.id !== creatorId &&
      !hasPerms(this.memberPermissions, PermissionFlagsBits.ManageMessages)
    ) {
      return CRBTError(this, errors.POLL_DATA_NOT_ALLOWED);
    }

    const pollData = await getPollData(`${this.channel.id}/${this.message.id}`);
    const choicesNames = this.message.embeds[0].fields.map(({ name }) => name);
    const choices = pollData.choices as string[][];

    this.reply({
      embeds: [
        {
          title: strings.POLL_DATA_OPTIONS,
          fields: choices.map((choice, index) => ({
            name: `${choicesNames[index]} (${choice.length})`,
            value:
              choice.length > 0
                ? trimArray(
                    choice.map((id) => `<@${id}>`),
                    15
                  ).join(', ')
                : strings.POLL_DATA_NOVOTES,
          })),
          footer: {
            text: strings.POLL_DATA_FOOTER,
          },
          color: await getColor(this.guild),
        },
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
          .setLabel(t(this, 'TITLE'))
          .setMaxLength(120)
          .setValue(msg.title)
          .setRequired(true)
          .setStyle('PARAGRAPH')
      ),
      ...msg.fields.map((field, index) =>
        row(
          new TextInputComponent()
            .setCustomId(`poll_option_${index}`)
            .setLabel(`${t(this, 'CHOICE')} ${index + 1}`)
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

    const Components = components(
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

    try {
      await prisma.poll.delete({
        where: { id: `${this.channel.id}/${msgId}` },
      });

      const msg = await this.channel.messages.fetch(msgId);
      await msg.delete();

      await this.update({
        embeds: [
          {
            title: `${emojis.success} ${strings.SUCCESS_POLL_DELETED}`,
            color: colors.success,
          },
        ],
        components: [],
      });
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
      await endPoll(pollData, msg);
    }

    await this.update({
      embeds: [
        {
          title: `${emojis.success} ${strings.SUCCESS_POLL_ENDED}`,
          color: colors.success,
        },
      ],
      components: [],
    });
  },
});

export const endPoll = async (poll: Poll, pollMsg: Message) => {
  const { strings } = t(poll.locale, 'poll');

  const choices = poll.choices as string[][];
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
      {
        title: `${emojis.tada} ${strings.POLL_RESULTS_TITLE}`,
        description:
          (winners.length > 1
            ? strings.POLL_RESULTS_DESCRIPTION_TIE.replace('<OPTION1>', ranking[0].name)
                .replace(
                  '<OPTION2>',
                  winners
                    .slice(1)
                    .map((winner) => winner.name)
                    .join(', ')
                )
                .replace('{VOTES}', ranking[0].votes.toString())
            : strings.POLL_RESULTS_DESCRIPTION_WIN.replace(
                '{OPTION}',
                `${ranking[0].name}`
              ).replace('{VOTES}', ranking[0].votes.toString())) +
          ' ' +
          strings.POLL_RESULTS_DESCRIPTION_REST.replace('{TOTAL}', totalVotes.toString()),
        color: colors.success,
      },
    ],
  });

  await pollMsg.edit({
    embeds: [
      {
        ...pollMsg.embeds[0],
        author: {
          name: `${strings.POLL_HEADER_ENDED}`,
        },
        description: '',
        fields: pollMsg.embeds[0].fields.map((field) => {
          if (winners.map(({ name }) => name).includes(field.name)) {
            return {
              name: `🏆 ${field.name}`,
              value: field.value,
              inline: false,
            };
          }
          return field;
        }),
        color: colors.gray,
      },
    ],
    components: [],
  });

  activePolls.delete(poll.id);

  await prisma.poll.delete({
    where: { id: poll.id },
  });
};

const renderPoll = async (
  choiceId: string,
  userId: string,
  poll: Poll,
  pollEmbed: MessageEmbed
) => {
  const { strings } = t(poll.locale, 'poll');

  const choices = poll.choices as string[][];
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

  const newData = await prisma.poll.update({
    where: { id: poll.id },
    data: { ...poll, choices },
  });

  activePolls.set(poll.id, newData);

  const totalVotes = choices.flat().length;

  pollEmbed.fields.forEach((choice, id) => {
    const votes = choices[id].length;
    let percentage = Math.round((votes / totalVotes) * 100);
    if (isNaN(percentage)) percentage = 0;
    if (percentage === Infinity) percentage = 100;

    choice.value = `${progressBar(percentage)}\n${strings.POLL_OPTION_RESULT.replace(
      '{PERCENTAGE}',
      percentage.toString()
    ).replace('{VOTES}', votes.toString())}`;
  });
  pollEmbed.footer.text = `${strings.POLL_FOOTER_VOTES.replace(
    '{VOTES}',
    totalVotes.toString()
  )} • ${pollEmbed.footer.text.split(' • ').slice(1).join(' • ')}`;

  return pollEmbed;
};
