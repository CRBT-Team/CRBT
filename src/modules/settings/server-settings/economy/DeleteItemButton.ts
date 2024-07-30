import { cache } from '$lib/cache';
import { prisma } from '$lib/db';
import { colors, emojis } from '$lib/env';
import { ButtonComponent, components, row } from 'purplet';
import { getGuildSettings } from '../_helpers';
import { getEmojiURL } from '$lib/functions/getEmojiURL';
import { ItemButton } from './MenuItem';
import { t } from '$lib/language';
import { renderItemCategoryEditMenu } from './MenuCategory';

export const DeleteItemButton = ButtonComponent({
  async handle(itemId: string) {
    const { economy } = await getGuildSettings(this.guildId);
    const item = economy.items.find((i) => i.id === itemId);

    await this.update({
      embeds: [
        {
          title: `⚠️ Are you sure you want to delete ${item.name}?`,
          description:
            'This action is definitive and will remove the item from the Shop, meaning it will no longer be available for purchase.',
          thumbnail: { url: getEmojiURL(item.emoji) },
          color: colors.error,
        },
      ],
      components: components(
        row(
          new ItemButton({ itemId, mode: 'edit' })
            .setLabel(t(this, 'CANCEL'))
            .setStyle('SECONDARY'),
          new ConfirmItemDeletionButton(itemId).setLabel(t(this, 'CONFIRM')).setStyle('DANGER'),
        ),
      ),
    });
  },
});

export const ConfirmItemDeletionButton = ButtonComponent({
  async handle(itemId: string) {
    await this.deferUpdate();
    const { economy } = await getGuildSettings(this.guildId);
    const item = economy.items.find((i) => i.id === itemId);
    const category = economy.categories.find((c) => c.id === item.categoryId);

    await prisma.item.delete({
      where: {
        id: itemId,
      },
    });

    cache.del(`item:${itemId}`);

    await this.editReply({
      content: `${emojis.success} Item successfully deleted.`,
      ...(await renderItemCategoryEditMenu.call(this, category)),
    });
  },
});
