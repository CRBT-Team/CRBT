import { prisma } from '$lib/db';
import { achievements, colors, icons } from '$lib/env';
import { slashCmd } from '$lib/functions/commandMention';
import { t } from '$lib/language';
import { CustomEmojiRegex, formatEmojiURL } from '@purplet/utils';
import {
  CommandInteraction,
  ContextMenuInteraction,
  GuildMember,
  Interaction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
  User,
} from 'discord.js';
import emojiJSON from '../../../data/misc/emoji.json';
import { emojiImg } from '../../modules/info/emoji info';

export interface Achievement {
  suggestedCommand?: string;
  emoji?: string;
  secret: boolean;
  steps: number;
}

export async function AchievementProgress(
  this:
    | CommandInteraction
    | ContextMenuInteraction
    | ModalSubmitInteraction
    | MessageComponentInteraction
    | GuildMember
    | User,
  type: string
) {
  const { steps, secret, emoji, suggestedCommand } = achievements[type] as Achievement;
  const uId = 'user' in this ? this.user?.id : this.id;

  const preferences =
    (await prisma.user.findFirst({ where: { id: uId }, select: { enableAchievements: true } }))
      ?.enableAchievements ?? true;

  if (!preferences) return;
  const id = `${uId}_${type}`;

  const data = await prisma.globalAchievements.findUnique({
    where: { id },
  });

  if (data && data.progression >= steps) return;

  const newData = await prisma.globalAchievements.upsert({
    create: {
      id,
      achievement: type,
      progression: 1,
      achievedAt: 1 === steps ? new Date() : undefined,
      user: {
        connectOrCreate: {
          create: { id: uId },
          where: { id: uId },
        },
      },
    },
    update: {
      achievedAt: (data?.progression || 0) + 1 === steps ? new Date() : undefined,
      progression: {
        increment: 1,
      },
    },
    where: { id },
  });

  if (newData.progression !== steps) return;

  const icon = emojiJSON.find((e) => e.char === emoji)
    ? emojiImg(emojiJSON.find((e) => e.char === emoji)).Twemoji
    : formatEmojiURL(emoji.match(CustomEmojiRegex)[0]);

  const locale = 'locale' in this ? this.locale : 'en-US';

  const embeds = [
    {
      author: {
        name: secret
          ? t(locale, 'ACHIEVEMENT_UNLOCKED_TITLE_SECRET')
          : t(locale, 'ACHIEVEMENT_UNLOCKED_TITLE'),
        icon_url: icons.giveaway,
      },
      title: t(locale, `ACHIEVEMENT_${id}_TITLE` as any),
      description: `${t(locale, `ACHIEVEMENT_${id}_DESC` as any, {
        command: suggestedCommand ? slashCmd(suggestedCommand) : null,
      })}\n${t(locale, 'ACHIEVEMENT_UNLOCKED_DESCRIPTION', {
        command: slashCmd('achievements'),
      })}`,
      thumbnail: { url: icon },
      color: secret ? colors.gold : colors.success,
    },
  ];

  if (this instanceof Interaction) {
    await this[this.replied || this.deferred ? 'followUp' : 'reply']({
      embeds,
      ephemeral: true,
    });
  } else {
    this.send({
      embeds,
    });
  }
}
