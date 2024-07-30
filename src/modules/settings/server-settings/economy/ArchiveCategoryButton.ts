import { prisma } from '$lib/db';
import { colors, emojis } from '$lib/env';
import { ButtonComponent, components, row } from 'purplet';
import { getGuildSettings } from '../_helpers';
import { getEmojiURL } from '$lib/functions/getEmojiURL';
import { t } from '$lib/language';
import dedent from 'dedent';
import { CancelItemCreateButton } from './CancelItemCreateButton';
import { renderItemCategoryEditMenu } from './MenuCategory';

export const ArchiveCategoryButton = ButtonComponent({
  async handle(categoryId: string) {
    const { economy } = await getGuildSettings(this.guildId);
    const category = economy.categories.find((c) => c.id === categoryId);

    await this.update({
      embeds: [
        {
          title: `Do you want to archive ${category.label}?`,
          description: dedent`All items in this category will no longer be purchaseable.
            
            You can unarchive it at any moment by clicking "Unarchive" when in the category menu.`,
          thumbnail: { url: getEmojiURL(category.emoji) },
          color: colors.yellow,
        },
      ],
      components: components(
        row(
          new CancelItemCreateButton(category.id).setLabel(t(this, 'CANCEL')).setStyle('SECONDARY'),
          new ConfirmCategoryArchivingButton(categoryId)
            .setLabel(t(this, 'CONFIRM'))
            .setStyle('DANGER'),
        ),
      ),
    });
  },
});

export const ConfirmCategoryArchivingButton = ButtonComponent({
  async handle(categoryId: string) {
    await this.deferUpdate();

    const newCategory = await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        archived: true,
      },
      include: {
        items: true,
      },
    });

    await this.editReply({
      ...(await renderItemCategoryEditMenu.call(this, newCategory)),
      content: `${emojis.success} Category successfully archived. Unarchive it using the "Unarchive" button.`,
    });
  },
});

export const UnarchiveButton = ButtonComponent({
  async handle(itemId: string) {
    await this.deferUpdate();

    const newCategory = await prisma.category.update({
      where: {
        id: itemId,
      },
      data: {
        archived: false,
      },
      include: {
        items: true,
      },
    });

    await this.editReply(await renderItemCategoryEditMenu.call(this, newCategory));
  },
});
