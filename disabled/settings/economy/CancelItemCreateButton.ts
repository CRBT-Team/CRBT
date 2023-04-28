import { ButtonComponent } from 'purplet';
import { getGuildSettings } from '../../../src/modules/settings/server-settings/_helpers';
import { renderItemCategoryEditMenu } from './CategorySelectMenu';
import { newItemCache } from './CreateItemPart1';

export const CancelItemCreateButton = ButtonComponent({
  async handle(categoryId: number) {
    newItemCache.delete(this.message.id);
    const { economy } = await getGuildSettings(this.guildId);
    const category = economy.categories.find((c) => c.id === categoryId);

    await this.update(await renderItemCategoryEditMenu.call(this, category, economy));
  },
});
