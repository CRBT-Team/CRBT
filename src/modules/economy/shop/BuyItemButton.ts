import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { emojis } from '$lib/env';
import { ButtonComponent, components, row } from 'purplet';
import { getGuildSettings } from '../../settings/server-settings/_helpers';
import { ShopGoToButton } from './shop';
import { slashCmd } from '$lib/functions/commandMention';
import { GoToPageButton } from '../inventory/GoToPageButton';

export const BuyItemButton = ButtonComponent({
  async handle(itemId: string) {
    await this.deferUpdate();

    const userId = `${this.user.id}_${this.guildId}`;

    const inventory = await fetchWithCache(`inventory:${userId}`, () =>
      prisma.guildMember.upsert({
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
          guild: {
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
      }),
    );
    const item = inventory.items.find((i) => i.id === itemId);

    if (item.stock !== null) {
      await prisma.item.update({
        where: { id: itemId },
        data: {
          stock: {
            decrement: 1,
          },
        },
      });
    }

    await getGuildSettings(this.guildId, true);

    await this.editReply({
      content: `${emojis.success} Transaction complete! To use your item, open your ${slashCmd('inventory')}.`,
      components: components(
        row(
          new ShopGoToButton({ categoryId: item.categoryId })
            .setEmoji(emojis.buttons.left_arrow)
            .setStyle('SECONDARY'),
          new GoToPageButton({
            page: 0,
          })
            .setLabel('In inventory')
            .setStyle('SECONDARY'),
        ),
      ),
    });
  },
});
