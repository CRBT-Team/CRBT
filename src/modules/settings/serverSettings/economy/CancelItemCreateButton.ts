import { ButtonComponent } from 'purplet';
import { getSettings } from '../_helpers';
import { renderItemCategory } from './CategorySelectMenu';
import { newItemCache } from './CreateItemPart1';

export const CancelItemCreateButton = ButtonComponent({
  async handle(categoryId: number) {
    newItemCache.delete(this.message.id);
    const { economy } = await getSettings(this.guildId);
    const category = economy.categories.find((c) => c.id === categoryId);

    await this.update(await renderItemCategory.call(this, category, economy));
  },
});
