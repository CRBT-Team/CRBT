import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { emojis } from '$lib/env';
import { MessageButton } from 'discord.js';
import { ButtonComponent, components, row } from 'purplet';
import { getGuildSettings } from '../../settings/serverSettings/_helpers';
import { BackButton } from './shop';

export const BuyItemButton = ButtonComponent({
  async handle(itemId: number) {
    await this.deferUpdate();

    const userId = `${this.user.id}_${this.guildId}`;
    const inventory = await fetchWithCache(`inventory:${userId}`, () =>
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
        include: { items: true },
      })
    );
    const item = inventory.items.find((i) => i.id === itemId);

    await getGuildSettings(this.guildId, true);

    await this.editReply({
      content: `${emojis.success} Transaction complete! To use your item, open your inventory.`,
      components: components(
        row(
          new BackButton(item.categoryId).setEmoji(emojis.buttons.left_arrow).setStyle('SECONDARY'),
          // todo: make this a btn to open the user's inventory so they can use it
          new MessageButton({
            customId: 'hahayouboughtthisthatssocool',
            label: 'In inventory',
            style: 'SECONDARY',
            disabled: true,
          })
        )
      ),
    });
  },
});
