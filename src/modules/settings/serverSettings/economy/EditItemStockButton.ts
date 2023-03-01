import { ButtonComponent, row } from 'purplet';
import { ItemEditProps } from '.';
import { getSettings } from '../_helpers';
import { newItemCache } from './CreateItemPart1';
import { EditItemStockModal } from './EditItemStockModal';

export const EditItemStockButton = ButtonComponent({
  async handle({ id, mode, cId }: ItemEditProps) {
    const {
      economy: { items },
    } = await getSettings(this.guildId);
    const itemInfo =
      id && mode === 'edit' ? items.find((i) => i.id === id) : newItemCache.get(this.message.id);

    await this.showModal(
      new EditItemStockModal({ id, mode, cId }).setTitle('Edit Item').setComponents(
        row({
          type: 'TEXT_INPUT',
          customId: 'stock',
          value: itemInfo?.stock?.toString() || undefined,
          minLength: 1,
          maxLength: 9,
          placeholder: 'You may only use numbers. (leave blank to reset)',
          label: 'Stock',
          style: 'SHORT',
        })
      )
    );
  },
});
