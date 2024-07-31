import { prisma } from '$lib/db';
import { colors, emojis } from '$lib/env';
import { ButtonComponent, components, row } from 'purplet';
import { getGuildSettings } from '../_helpers';
import { getEmojiURL } from '$lib/functions/getEmojiURL';
import { t } from '$lib/language';
import { CancelItemCreateButton } from './CancelItemCreateButton';
import { renderShopSettings } from './MenuShop';

export const DeleteCategoryButton = ButtonComponent({
  async handle(categoryId: string) {
    const { economy } = await getGuildSettings(this.guildId);
    const category = economy.categories.find((c) => c.id === categoryId);

    await this.update({
      embeds: [
        {
          title: `⚠️ Are you sure you want to delete ${category.label}?`,
          description:
            `This action is definitive and will remove this category and all ${category.items} items from the Shop, forever.\n\n` +
            category.items.map((i) => `• ${i.emoji} ${i.name}`).join('\n'),
          thumbnail: { url: getEmojiURL(category.emoji) },
          color: colors.error,
        },
      ],
      components: components(
        row(
          new CancelItemCreateButton(categoryId).setLabel(t(this, 'CANCEL')).setStyle('SECONDARY'),
          new ConfirmCategoryDeletionButton(categoryId)
            .setLabel(t(this, 'CONFIRM'))
            .setStyle('DANGER'),
        ),
      ),
    });
  },
});

export const ConfirmCategoryDeletionButton = ButtonComponent({
  async handle(categoryId: string) {
    await this.deferUpdate();

    await prisma.item.deleteMany({
      where: {
        categoryId,
      },
    });

    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    });

    await getGuildSettings(this.guildId, true);

    await this.editReply({
      ...(await renderShopSettings.call(this)),
      content: `${emojis.success} Category successfully deleted.`,
    });
  },
});
