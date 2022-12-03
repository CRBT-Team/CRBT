import { colors, emojis } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { ExtractedReminder, extractReminder } from '$lib/functions/extractReminder';
import { getColor } from '$lib/functions/getColor';
import { t } from '$lib/language';
import { Reminder } from '@prisma/client';
import { timestampMention } from '@purplet/utils';
import { APIEmbedAuthor } from 'discord-api-types/v10';
import { Client, MessageButton } from 'discord.js';
import { components, row } from 'purplet';
import { getReminderSubject } from '../../modules/tools/reminder_list';

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
  const { strings } = t(reminder.locale, 'remind me');

  const data = await extractReminder(reminder, client);

  const message = {
    embeds: [
      {
        title: `${emojis.reminder} ${t(reminder.locale, 'REMINDER')}}`,
        description: strings.REMINDER_DESCRIPTION.replace(
          '{TIME}',
          timestampMention(reminder.expiresAt, 'D')
        ).replace('{RELATIVE_TIME}', timestampMention(reminder.expiresAt, 'R')),
        fields: [
          {
            name: t(reminder.locale, 'SUBJECT'),
            value: getReminderSubject(reminder, client, 0),
          },
        ],
        color: await getColor(data.user),
      },
      ...renderLowBudgetMessage(data),
    ],
    components: components(
      row(
        new MessageButton()
          .setStyle('LINK')
          .setLabel(t(reminder?.locale, 'JUMP_TO_MSG'))
          .setURL(data.url)
        // new SnoozeButton()
        //   .setStyle('SECONDARY')
        //   .setEmoji(emojis.reminder)
        //   .setLabel(strings.BUTTON_SNOOZE)
      )
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

export function renderLowBudgetMessage({
  author,
  details,
  guild,
  channel,
}: Pick<ExtractedReminder, 'author' | 'details' | 'guild' | 'channel'>) {
  if (!details) return [];

  return [
    {
      author: {
        name: author.tag,
        icon_url: avatar(author),
      },
      description: details.content,
      footer: {
        text: `${guild.name} • #${channel.name}`,
      },
      color: author.accentColor ?? colors.blurple,
    },
    details.firstEmbed,
  ].filter(Boolean);
}
