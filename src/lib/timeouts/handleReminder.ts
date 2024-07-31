import { colors, icons } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { formatUsername } from '$lib/functions/formatUsername';
import { getColor } from '$lib/functions/getColor';
import { t } from '$lib/language';
import { Reminder } from '@prisma/client';
import { formatGuildEventCoverURL, snowflakeToDate, timestampMention } from '@purplet/utils';
import { APIEmbedAuthor } from 'discord-api-types/v10';
import { Client, MessageButton, MessageOptions } from 'discord.js';
import { components, row } from 'purplet';
import {
  ExtractedReminder,
  extractReminder,
  getReminderSubject,
} from '../../modules/tools/reminders/_helpers';

export interface LowBudgetMessage {
  authorId: string;
  content?: string;
  firstEmbed?: {
    author?: APIEmbedAuthor;
    title?: string;
    description?: string;
    color?: number;
  };
}

export async function handleReminder(reminder: Reminder, client: Client) {
  const data = await extractReminder(reminder, client);
  const createdAt = snowflakeToDate(data.messageId || data.event?.id);

  if (data.event && data.event.status === 'CANCELED') return;

  const message = {
    embeds: [
      {
        author: {
          name: t(reminder.locale, 'REMINDER'),
          icon_url: icons.reminder,
        },
        title: data.event?.name ?? getReminderSubject(reminder, client, 0),
        description: data.event?.description,
        fields: [
          ...(data.event?.scheduledEndAt
            ? [
                {
                  name: t(reminder.locale, 'END_DATE'),
                  value: timestampMention(data.event.scheduledEndAt),
                },
              ]
            : []),
          {
            name: t(reminder.locale, 'CREATED_ON'),
            value: `${timestampMention(createdAt)} • ${timestampMention(createdAt, 'R')}`,
          },
        ],
        image:
          data.event && data.event.image
            ? { url: formatGuildEventCoverURL(data.event.id, data.event.image, { size: '512' }) }
            : null,
        color: await getColor(data.user),
      },
      ...renderLowBudgetMessage(data, reminder.locale),
    ],
    components: components(
      row(
        new MessageButton()
          .setStyle('LINK')
          .setLabel(
            data.event ? t(reminder.locale, 'VIEW_DETAILS') : t(reminder.locale, 'JUMP_TO_MSG'),
          )
          .setURL(data.url),
        // new SnoozeButton()
        //   .setStyle('SECONDARY')
        //   .setEmoji(emojis.reminder)
        //   .setLabel(strings.BUTTON_SNOOZE)
      ),
    ),
  };

  try {
    await data.destination.send({
      allowedMentions: {
        users: [data.user.id],
      },
      content: reminder.destination !== 'dm' ? data.user.toString() : null,
      ...message,
    });
  } catch (e) {
    await data.channel.send({
      allowedMentions: {
        users: [data.user.id],
      },
      content: data.user.toString(),
      ...message,
    });
  }
}

export function renderLowBudgetMessage(
  {
    author,
    details,
    guild,
    channel,
  }: Pick<ExtractedReminder, 'author' | 'details' | 'guild' | 'channel'>,
  locale: string = 'en-US',
): MessageOptions['embeds'] {
  if (!details) return [];

  return [
    {
      author: {
        name: formatUsername(author),
        icon_url: avatar(author),
      },
      description: details.content,
      footer: {
        text: `${'name' in guild ? guild.name : t(locale, 'DMS')} • #${channel.name}`,
      },
      color: author.accentColor ?? colors.blurple,
    },
    details.firstEmbed,
  ].filter(Boolean);
}
