import { prisma } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { parseEmojiString } from '$lib/functions/parseEmojiString';
import { ModalComponent } from 'purplet';
import { getGuildSettings } from '../../../src/modules/settings/server-settings/_helpers';
import { renderItemCategoryEditMenu } from './CategorySelectMenu';

export const EditCategoryModal = ModalComponent({
  async handle(categoryId: number) {
    await this.deferUpdate();

    const {
      economy: { categories },
    } = await getGuildSettings(this.guildId);
    const category = categories.find(({ id }) => id === categoryId);
    const newCategoryEmoji = await parseEmojiString(
      this.fields.getTextInputValue('emoji') || category.emoji,
      await this.guild.emojis.fetch()
    );

    if (!newCategoryEmoji) {
      return CRBTError(
        this,
        'The emoji used for the symbol is invalid! Please use a unicode emoji or an emoji in the server using its name or full ID.'
      );
    }

    const newCategory = await prisma.economyItemCategory.update({
      where: { id: category.id },
      data: {
        emoji: newCategoryEmoji,
        label: this.fields.getTextInputValue('label') || category.label,
      },
      include: { items: true },
    });

    const newSettings = await getGuildSettings(this.guildId, true);

    await this.editReply(await renderItemCategoryEditMenu.call(this, newCategory, newSettings));
  },
});
