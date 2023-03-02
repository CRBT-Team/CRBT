import { prisma } from '$lib/db';
import { ButtonComponent } from 'purplet';
import { getSettings } from '../_helpers';
import { newItemCache } from './CreateItemPart1';
import { renderItem } from './ItemSelectMenu';

export const CreateItemSaveButton = ButtonComponent({
  async handle() {
    //TODO: add loading state
    await this.deferUpdate();
    const buildingItem = newItemCache.get(this.message.id);

    const newItem = await prisma.economyItem.create({
      data: {
        category: {
          connect: { id: buildingItem.categoryId },
        },
        economy: {
          connect: { id: this.guildId },
        },
        ...(({ categoryId, serverId, ...o }) => o)(buildingItem),
      },
    });
    newItemCache.delete(this.message.id);

    const { economy } = await getSettings(this.guildId, true);

    await this.editReply(await renderItem.call(this, newItem, economy));
  },
});
