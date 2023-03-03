import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { Message } from 'discord.js';
import { ButtonComponent } from 'purplet';
import { getSettings } from '../../settings/serverSettings/_helpers';

export const BuyItemButton = ButtonComponent({
  async handle(itemId: number) {
    const userId = `${this.user.id}_${this.guildId}`;
    await fetchWithCache(`items:${userId}`, () =>
      prisma.serverMember.upsert({
        where: { id: userId },
        create: {
          id: userId,
          items: {
            connect: { id: itemId },
          },
          user: {
            connectOrCreate: {
              create: { id: this.user.id },
              where: { id: this.user.id },
            },
          },
          server: {
            connect: { id: this.guildId },
          },
          dailyStreak: 0,
        },
        update: {
          items: {
            connect: { id: itemId },
          },
        },
      })
    );

    await getSettings(this.guildId, true);

    //TODO: do shit
    await (this.message as Message).edit({});
  },
});
