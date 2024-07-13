import { prisma } from '$lib/db';
import { dateToSnowflake } from '@purplet/utils';
import { ButtonComponent } from 'purplet';
import { getGuildSettings } from '../_helpers';
import { newItemCache } from './CreateItemPart1';
import { renderItem } from './renderItem';

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

    const { economy } = await getGuildSettings(this.guildId, true);

    await this.editReply(await renderItem.call(this, newItem, economy, 'edit'));
  },
});
