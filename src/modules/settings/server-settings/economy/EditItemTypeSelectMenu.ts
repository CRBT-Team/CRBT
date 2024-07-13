import { SelectMenuComponent } from 'purplet';
import { ItemType } from '../../../economy/_helpers';
import { newItemCache } from './CreateItemPart1';
import { handleCreateItemPart2 } from './CreateItemPart2';

export const EditItemTypeSelectMenu = SelectMenuComponent({
  async handle(ctx: null) {
    const type = parseInt(this.values[0]) as ItemType;
    const newData = {
      ...newItemCache.get(this.message.id),
      type,
    };

    newItemCache.set(this.message.id, newData);

    await handleCreateItemPart2.call(this);
  },
});
