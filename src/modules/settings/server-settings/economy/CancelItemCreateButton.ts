import { ButtonComponent } from 'purplet';
import { getGuildSettings } from '../_helpers';
import { renderItemCategoryEditMenu } from './MenuCategory';
import { newItemCache } from './CreateItemPart1';

export const CancelItemCreateButton = ButtonComponent({
  async handle(categoryId: string) {
    newItemCache.delete(this.message.id);
    const { economy } = await getGuildSettings(this.guildId);
    const category = economy.categories.find((c) => c.id === categoryId);

    await this.update(await renderItemCategoryEditMenu.call(this, category, economy));
  },
});
