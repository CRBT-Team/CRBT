import { ButtonComponent } from 'purplet';
import { getSettings } from '../../../src/modules/settings/serverSettings/_helpers';
import { renderItemCategoryEditMenu } from './CategorySelectMenu';
import { newItemCache } from './CreateItemPart1';

export const CancelItemCreateButton = ButtonComponent({
  async handle(categoryId: number) {
    newItemCache.delete(this.message.id);
    const { economy } = await getSettings(this.guildId);
    const category = economy.categories.find((c) => c.id === categoryId);

    await this.update(await renderItemCategoryEditMenu.call(this, category, economy));
  },
});
