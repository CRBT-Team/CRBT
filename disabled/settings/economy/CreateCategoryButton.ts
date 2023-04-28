import { prisma } from '$lib/db';
import { ButtonComponent } from 'purplet';
import { getGuildSettings } from '../../../src/modules/settings/server-settings/_helpers';
import { renderItemCategoryEditMenu } from './CategorySelectMenu';

export const CreateCategoryButton = ButtonComponent({
  async handle() {
    await this.deferUpdate();

    const category = await prisma.economyItemCategory.create({
      data: {
        guild_id: this.guildId,
        label: 'New Category',
        emoji: '📁',
      },
      include: { items: true },
    });

    const { economy } = await getGuildSettings(this.guildId, true);

    await this.editReply(await renderItemCategoryEditMenu.call(this, category, economy));
  },
});
