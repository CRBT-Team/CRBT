import { prisma } from '$lib/db';
import { colors, emojis } from '$lib/env';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { dbTimeout } from '$lib/timeouts/dbTimeout';
import { LowBudgetMessage, renderLowBudgetMessage } from '$lib/timeouts/handleReminder';
import { TimeoutTypes } from '$lib/types/timeouts';
import { Reminder } from '@prisma/client';
import { timestampMention } from '@purplet/utils';
import dayjs from 'dayjs';
import { MessageFlags } from 'discord-api-types/v10';
import { randomBytes } from 'node:crypto';
import { MessageContextCommand } from 'purplet';

export default MessageContextCommand({
  name: 'Remind me about this',
  async handle(message) {
    const url = message.url.replace(/https:\/\/((canary|ptb)\.)?discord\.com\/channels\//, '');

    const { strings, errors } = t(this, 'remind me');

    const userReminders = await prisma.reminder.findMany({
      where: { userId: this.user.id },
    });

    if (userReminders.length >= 10) {
      return CRBTError(this, errors.REMINDERS_MAX_LIMIT);
    }

    const embed = message.embeds.find((e) => e.title || e.description || e.fields[0].name);

    console.log(embed);
    const subject = `${(
      message.content ||
      embed?.title ||
      embed?.description ||
      embed?.fields[0].name
    ).slice(0, 50)}...`;

    const now = dayjs();
    const expiresAt = dayjs().add(15, 'm');

    try {
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
        ...(!message.content && message.embeds
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

      this.reply({
        embeds: [
          {
            title: `${emojis.success} ${strings.SUCCESS_TITLE}`,
            description:
              `${strings.SUCCESS_DM}\n` +
              (expiresAt.format('YYYY-MM-DD') === now.format('YYYY-MM-DD')
                ? strings.TODAY_AT.replace('<TIME>', formattedExpires)
                : expiresAt.format('YYYY-MM-DD') === now.add(1, 'day').format('YYYY-MM-DD')
                ? strings.TOMORROW_AT.replace('<TIME>', formattedExpires)
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
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      await this.editReply(UnknownError(this, String(error)));
    }
  },
});
