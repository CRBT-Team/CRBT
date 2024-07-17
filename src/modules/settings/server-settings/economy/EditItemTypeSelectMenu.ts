import { SelectMenuComponent } from 'purplet';
import { ItemType } from '../../../economy/_helpers';
import { newItemCache } from './CreateItem1Info';
import { handleCreateItemPart2 } from './CreateItem2Value';

export const EditItemTypeSelectMenu = SelectMenuComponent({
  async handle(ctx: null) {
    const type = parseInt(this.values[0]) as ItemType;
    const newData = {
      ...newItemCache.get(this.message.id),
      type,
      value: undefined, // Reset value when changing type
    };

    newItemCache.set(this.message.id, newData);

    await handleCreateItemPart2.call(this);
  },
});
