import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { resolveToDate } from '$lib/functions/resolveToDate';
import { t } from '$lib/language';
import { Item } from '@prisma/client';
import { Dayjs } from 'dayjs';
import { ModalComponent } from 'purplet';
import { ItemEditProps } from './MenuOverview';
import { newItemCache } from './CreateItem1Info';
import { handleCreateItemPart3 } from './CreateItem3Availability';
import { renderItem } from './MenuItem';

export const EditItemAvailabilityModal = ModalComponent({
  async handle({ mode, id }: ItemEditProps) {
    const stock = this.fields.getTextInputValue('stock')
      ? parseInt(this.fields.getTextInputValue('stock'))
      : null;
    const rawDate = this.fields.getTextInputValue('date');
    let date: Dayjs | null = null;

    if (rawDate) {
      try {
        date = await resolveToDate(rawDate);
      } catch (e) {
        return CRBTError(this, t(this, 'remind me.errors.INVALID_FORMAT'));
      }
    }

    if (stock !== null && isNaN(stock)) {
      return CRBTError(this, 'The stock must be a number, without decimals.');
    }

    if (stock < 1 || stock > Number.MAX_SAFE_INTEGER) {
      return CRBTError(
        this,
        `The stock cannot be set below 1 or be higher than ${Number.MAX_SAFE_INTEGER}.`,
      );
    }

    if (mode === 'setup') {
      const newData: Partial<Item> = {
        ...newItemCache.get(this.message.id),
        stock: stock,
        availableUntil: date?.toDate(),
      };

      newItemCache.set(this.message.id, newData);

      return handleCreateItemPart3.call(this);
    } else {
      const newData = await fetchWithCache(
        `economyItem:${id}`,
        () =>
          prisma.item.update({
            where: { id: id },
            data: {
              stock: stock,
              availableUntil: date?.toDate(),
            },
            include: {
              owners: true,
              activeMembers: true,
            },
          }),
        true,
      );

      return this.update(await renderItem.call(this, newData, 'edit'));
    }
  },
});
