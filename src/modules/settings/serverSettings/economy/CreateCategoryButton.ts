import { prisma } from '$lib/db';
import { ButtonComponent } from 'purplet';
import { getSettings } from '../_helpers';
import { renderItemCategory } from './CategorySelectMenu';

export const CreateCategoryButton = ButtonComponent({
  async handle() {
    await this.deferUpdate();

    const category = await prisma.economyItemCategory.create({
      data: {
        serverId: this.guildId,
        label: 'New Category',
        emoji: '📁',
      },
      include: { items: true },
    });

    const { economy } = await getSettings(this.guildId, true);

    await this.editReply(await renderItemCategory.call(this, category, economy));
  },
});
