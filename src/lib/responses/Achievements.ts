import { achievements, colors, db, icons } from '$lib/db';
import { AchievementNames } from '@prisma/client';
import {
  CommandInteraction,
  ContextMenuInteraction,
  MessageEmbed,
  ModalSubmitInteraction,
} from 'discord.js';
import { allCommands } from '../../modules/events/ready';

export async function AchievementProgress(
  this: CommandInteraction | ContextMenuInteraction | ModalSubmitInteraction,
  type: AchievementNames
) {
  const achievement = achievements[type];

  const data = await db.achievements.findUnique({
    where: {
      id: `${this.user.id}_${type}`,
    },
  });

  if (data && data.progression >= achievement.steps) return;

  const newData = await db.achievements.upsert({
    create: {
      id: `${this.user.id}_${type}`,
      achievement: type,
      progression: 1,
      achievedAt: 1 === achievement.steps ? new Date() : undefined,
      // userId: this.user.id,
      user: {
        connectOrCreate: {
          create: {
            id: this.user.id,
          },
          where: {
            id: this.user.id,
          },
        },
      },
    },
    update: {
      achievedAt: data?.progression || 0 + 1 === achievement.steps ? new Date() : undefined,
      progression: {
        increment: 1,
      },
    },
    where: {
      id: `${this.user.id}_${type}`,
    },
  });

  if (newData.progression !== achievement.steps) return;

  const achievementsCmd = allCommands.find(({ name }) => name === 'achievements');

  await this[this.replied ? 'followUp' : 'reply']({
    embeds: [
      new MessageEmbed()
        .setAuthor({
          name: `${achievement.name} - Achievement Unlocked!`,
          iconURL: icons.giveaway,
        })
        .setDescription(
          `${achievement.howToGet} - Check your achievements with </${achievementsCmd.name}:${achievementsCmd.id}>`
        )
        .setColor(`#${colors.success}`),
    ],
    ephemeral: true,
  });
}
