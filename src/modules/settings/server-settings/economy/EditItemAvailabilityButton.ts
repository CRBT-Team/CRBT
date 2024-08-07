import dayjs from 'dayjs';
import { ButtonComponent, row } from 'purplet';
import { ItemEditProps } from './MenuOverview';
import { getGuildSettings } from '../_helpers';
import { newItemCache } from './CreateItem1Info';
import { EditItemAvailabilityModal } from './EditItemAvailabilityModal';

export const EditItemAvailabilityButton = ButtonComponent({
  async handle({ id, mode, cId }: ItemEditProps) {
    const {
      economy: { items },
    } = await getGuildSettings(this.guildId);
    const itemInfo =
      id && mode === 'edit' ? items.find((i) => i.id === id) : newItemCache.get(this.message.id);

    await this.showModal(
      new EditItemAvailabilityModal({ id, mode, cId }).setTitle('Edit Item').setComponents(
        row({
          type: 'TEXT_INPUT',
          customId: 'stock',
          value: itemInfo?.stock?.toString() || undefined,
          minLength: 1,
          maxLength: 16,
          placeholder: 'You may only use numbers. (leave blank to reset)',
          label: 'Stock',
          style: 'SHORT',
        }),
        row({
          type: 'TEXT_INPUT',
          value: itemInfo?.availableUntil
            ? dayjs(itemInfo?.availableUntil).format('YYYY-MM-DD HH:mm')
            : undefined,
          customId: 'date',
          label: 'Available until',
          minLength: 16,
          maxLength: 16,
          style: 'SHORT',
        }),
      ),
    );
  },
});
