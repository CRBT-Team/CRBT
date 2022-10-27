import { prisma } from '$lib/db';
import { achievements, colors, icons } from '$lib/env';
import { slashCmd } from '$lib/functions/commandMention';
import {
  CommandInteraction,
  ContextMenuInteraction,
  GuildMember,
  Interaction,
  MessageEmbed,
  ModalSubmitInteraction,
  User,
} from 'discord.js';

export interface Achievement {
  name: string;
  howToGet: string;
  emoji?: string;
  secret: boolean;
  steps: number;
}

export async function AchievementProgress(
  this: CommandInteraction | ContextMenuInteraction | ModalSubmitInteraction | GuildMember | User,
  type: keyof typeof achievements
) {
  const achievement = achievements[type] as Achievement;
  const uId = 'user' in this ? this.user?.id : this.id;

  const preferences =
    (await prisma.user.findFirst({ where: { id: uId }, select: { enableAchievements: true } }))
      ?.enableAchievements ?? true;

  if (!preferences) return;

  const data = await prisma.globalAchievements.findUnique({
    where: {
      id: `${uId}_${type}`,
    },
  });

  if (data && data.progression >= achievement.steps) return;

  const newData = await prisma.globalAchievements.upsert({
    create: {
      id: `${uId}_${type}`,
      achievement: type,
      progression: 1,
      achievedAt: 1 === achievement.steps ? new Date() : undefined,
      user: {
        connectOrCreate: {
          create: {
            id: uId,
          },
          where: {
            id: uId,
          },
        },
      },
    },
    update: {
      achievedAt: (data?.progression || 0) + 1 === achievement.steps ? new Date() : undefined,
      progression: {
        increment: 1,
      },
    },
    where: {
      id: `${uId}_${type}`,
    },
  });

  if (newData.progression !== achievement.steps) return;

  const icon = achievement?.emoji
    ? `https://cdn.discordapp.com/emojis/${achievement.emoji}.png`
    : icons.giveaway;

  const embeds = [
    new MessageEmbed()
      .setAuthor({
        name: `${achievement.name} - ${achievement.secret ? 'Secret ' : ''}Achievement Unlocked!`,
        iconURL: icons.giveaway,
      })
      .setDescription(
        `${achievement.howToGet}\nCheck your achievements with ${slashCmd('achievements')}.`
      )
      .setThumbnail(icon)
      .setColor(achievement.secret ? colors.gold : colors.success),
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
