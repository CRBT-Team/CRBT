import { prisma } from '$lib/db';
import { dateToSnowflake } from '@purplet/utils';
import { ButtonComponent } from 'purplet';
import { newItemCache } from './CreateItem1Info';
import { renderItem } from './MenuItem';

export const CreateItemSaveButton = ButtonComponent({
  async handle() {
    //TODO: add loading state
    await this.deferUpdate();
    const item = newItemCache.get(this.message.id);

    const newItem = await prisma.item.create({
      data: {
        id: dateToSnowflake(new Date()),
        name: item.name,
        price: item.price,
        type: item.type,
        stock: item.stock,
        availableUntil: item.availableUntil,
        value: item.value,
        emoji: item.emoji,
        description: item.description,
        category: {
          connect: { id: item.categoryId },
        },
        economy: {
          connect: { id: this.guildId },
        },
      },
    });
    newItemCache.delete(this.message.id);

    await this.editReply(await renderItem.call(this, newItem, 'edit'));
  },
});
