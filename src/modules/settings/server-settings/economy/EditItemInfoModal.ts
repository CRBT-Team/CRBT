import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { parseEmojiString } from '$lib/functions/parseEmojiString';
import { ModalComponent } from 'purplet';
import { ItemEditProps } from './MenuOverview';
import { handleCreateItemPart1, newItemCache } from './CreateItem1Info';
import { renderItem } from './MenuItem';

export const EditItemInfoModal = ModalComponent({
  async handle({ id, mode, cId }: ItemEditProps) {
    const emoji = await parseEmojiString(
      this.fields.getTextInputValue('icon'),
      await this.guild.emojis.fetch(),
    );
    const price = parseInt(this.fields.getTextInputValue('price'));
    if (price !== null && isNaN(price)) {
      return CRBTError(this, 'The price can only be a valid number without decimals.');
    }

    if (price < 0 || price > Number.MAX_SAFE_INTEGER) {
      return CRBTError(
        this,
        `The price cannot be set below 0 or be higher than ${Number.MAX_SAFE_INTEGER}.`,
      );
    }

    if (mode === 'setup') {
      newItemCache.set(this.message.id, {
        name: this.fields.getTextInputValue('name'),
        description: this.fields.getTextInputValue('description'),
        emoji,
        price,
        categoryId: cId,
      });

      return await handleCreateItemPart1.call(this, cId);
    } else {
      const newData = await fetchWithCache(
        `economyItem:${id}`,
        () =>
          prisma.item.update({
            where: { id: id },
            data: {
              name: this.fields.getTextInputValue('name'),
              description: this.fields.getTextInputValue('description'),
              emoji,
              price,
            },
            include: {
              members: true,
            },
          }),
        true,
      );

      return this.update(await renderItem.call(this, newData, 'edit'));
    }
  },
});
