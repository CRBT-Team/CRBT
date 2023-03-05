import { prisma } from '$lib/db';
import { ButtonComponent } from 'purplet';
import { getSettings } from '../_helpers';
import { newItemCache } from './CreateItemPart1';
import { renderItem } from './renderItem';

export const CreateItemSaveButton = ButtonComponent({
  async handle() {
    //TODO: add loading state
    await this.deferUpdate();
    const item = newItemCache.get(this.message.id);

    const newItem = await prisma.economyItem.create({
      data: {
        name: item.name,
        price: item.price,
        type: item.type,
        stock: item.stock,
        availableUntil: item.availableUntil,
        value: item.value,
        icon: item.icon,
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

    const { economy } = await getSettings(this.guildId, true);

    await this.editReply(await renderItem.call(this, newItem, economy, 'edit'));
  },
});
