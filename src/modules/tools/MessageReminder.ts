import { prisma } from '$lib/db';
import { colors, emojis } from '$lib/env';
import { slashCmd } from '$lib/functions/commandMention';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { dbTimeout } from '$lib/timeouts/dbTimeout';
import { LowBudgetMessage, renderLowBudgetMessage } from '$lib/timeouts/handleReminder';
import { TimeoutTypes } from '$lib/types/timeouts';
import { Reminder } from '@prisma/client';
import { timestampMention } from '@purplet/utils';
import dayjs from 'dayjs';
import { Message } from 'discord.js';
import { randomBytes } from 'node:crypto';
import { components, MessageContextCommand, row, SelectMenuComponent } from 'purplet';

export const messageCache = new Map<string, Message>();

export default MessageContextCommand({
  name: 'Remind me about this',
  async handle(message) {
    messageCache.set(message.id, message);

    await this.reply({
      embeds: [
        {
          title: `${emojis.pending} Select when to be remind of that message`,
          description: `You can edit this later with ${slashCmd('reminder list')}`,
          color: colors.yellow,
        },
      ],
      ephemeral: true,
      components: components(
        row(
          new SelectTimeMenu(message.id).setOptions(
            [
              '10-minutes',
              '30-minutes',
              '1-hour',
              '3-hours',
              '6-hours',
              '12-hours',
              '1-day',
              '3-days',
              '1-week',
            ].map((h) => ({
              label: h.replace('-', ' '),
              value: h,
            }))
          )
        )
      ),
    });
  },
});

export const SelectTimeMenu = SelectMenuComponent({
  async handle(mId: string) {
    const message = messageCache.get(mId);

    await this.deferUpdate();

    const url = message.url.replace(/https:\/\/((canary|ptb)\.)?discord\.com\/channels\//, '');

    const { strings, errors } = t(this, 'remind me');

    const userReminders = await prisma.reminder.findMany({
      where: { userId: this.user.id },
    });

    if (userReminders.length >= 10) {
      return CRBTError(this, errors.REMINDERS_MAX_LIMIT);
    }

    const embed = message.embeds.find((e) => e.title || e.description || e.fields[0].name);

    const subject = `${(
      message.content ||
      embed?.title ||
      embed?.description ||
      embed?.fields[0].name ||
      ''
    )?.slice(0, 60)}...`;

    const now = dayjs();
    const [length, unit] = this.values[0].split('-');
    const expiresAt = dayjs().add(Number(length), unit);

    const details: LowBudgetMessage = {
      authorId: message.author.id,
      ...(message.content
        ? {
            content:
              message.content.length > 150
                ? `${message.content.slice(0, 150)}...`
                : message.content,
          }
        : {}),
      ...(!message.content && message.embeds[0]
        ? {
            firstEmbed: {
              author: message.embeds[0].author,
              title: message.embeds[0].title,
              description: message.embeds[0].description,
              color: message.embeds[0].color,
            },
          }
        : {}),
    };

    try {
      const timeout: Reminder = {
        userId: this.user.id,
        destination: 'dm',
        expiresAt: expiresAt.toDate(),
        locale: this.locale,
        id: `${url}-MESSAGEREMINDER-${randomBytes(6)}`,
        subject: `${message.author.tag}--${subject}`,
        details: JSON.stringify(details),
      };

      await dbTimeout({ ...timeout, type: TimeoutTypes.Reminder });

      const formattedExpires = `${timestampMention(expiresAt, 'T')} • ${timestampMention(
        expiresAt,
        'R'
      )}`;

      await this.editReply({
        embeds: [
          {
            title: `${emojis.success} ${strings.SUCCESS_TITLE}`,
            description:
              `${strings.SUCCESS_DM}\n` +
              (expiresAt.format('YYYY-MM-DD') === now.format('YYYY-MM-DD')
                ? strings.TODAY_AT.replace('{TIME}', formattedExpires)
                : expiresAt.format('YYYY-MM-DD') === now.add(1, 'day').format('YYYY-MM-DD')
                ? strings.TOMORROW_AT.replace('{TIME}', formattedExpires)
                : formattedExpires),
            fields: [
              {
                name: strings.SUBJECT,
                value: subject,
              },
            ],
            color: colors.success,
          },
          ...renderLowBudgetMessage({
            details,
            channel: this.channel,
            guild: this.guild,
            author: message.author,
          }),
        ],
        components: [],
      });
    } catch (error) {
      await this.editReply(UnknownError(this, String(error)));
    }
  },
});
