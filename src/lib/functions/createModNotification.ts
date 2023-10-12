import { icons } from '$lib/env';
import { t } from '$lib/language';
import { timestampMention } from '@purplet/utils';
import { APIEmbedAuthor } from 'discord-api-types/v10';
import { User } from 'discord.js';
import {
  ChannelModerationActions,
  ModerationAction,
  ModerationColors,
  ModerationContext,
  moderationVerbStrings,
} from '../../modules/moderation/_base';
import { avatar } from './avatar';
import { formatUsername } from './formatUsername';
import { getEmojiURL } from './getEmojiURL';

export function createModNotification(
  { type, reason, endDate, messagesDeleted, user, target }: ModerationContext,
  locale: string,
) {
  const fields = [
    ...(type !== ModerationAction.ChannelUnlock
      ? [
          {
            name: t(locale, 'REASON'),
            value: reason ?? `*${t(locale, 'NONE')}*`,
          },
        ]
      : []),
    {
      name: t(locale, 'MODERATOR'),
      value: `<@${user.id}>`,
      inline: true,
    },
    {
      name: t(locale, ChannelModerationActions.includes(type) ? 'CHANNEL' : 'USER'),
      value: ChannelModerationActions.includes(type) ? `<#${target.id}>` : `<@${target.id}>`,
      inline: true,
    },
    ...(endDate
      ? [
          {
            name: t(locale, 'END_DATE'),
            value: `${timestampMention(endDate)} • ${timestampMention(endDate, 'R')}`,
          },
        ]
      : []),
  ];

  if (target instanceof User) {
    return {
      embeds: [
        {
          author: {
            name: `${formatUsername(target)} was ${t(
              locale,
              `MOD_VERB_${moderationVerbStrings[type]}` as any,
            ).toLocaleLowerCase(locale)}`,
            icon_url: avatar(target),
          },
          fields,
          color: ModerationColors[type],
        },
      ],
    };
  } else {
    let author: APIEmbedAuthor;

    switch (type) {
      case ModerationAction.ChannelMessageClear: {
        author = {
          name: t(locale, 'MOD_NOTIFICATION_CLEAR_TITLE', {
            messages: messagesDeleted,
            channel: `#${target.name}`,
          }),
          icon_url: icons.channels.text,
        };
        break;
      }
      case ModerationAction.ChannelLock: {
        author = {
          name: t(locale, 'MOD_NOTIFICATION_LOCK_TITLE', {
            channel: `#${target.name}`,
          }),
          icon_url: getEmojiURL('🔒'),
        };
        break;
      }
      case ModerationAction.ChannelUnlock: {
        author = {
          name: t(locale, 'MOD_NOTIFICATION_UNLOCK_TITLE', {
            channel: `#${target.name}`,
          }),
          icon_url: getEmojiURL('🔓'),
        };
        break;
      }
    }

    return {
      embeds: [
        {
          author,
          fields,
          color: ModerationColors[type],
        },
      ],
    };
  }
}
