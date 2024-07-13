import { prisma } from '$lib/db';
import { dateToSnowflake } from '@purplet/utils';
import { ButtonComponent } from 'purplet';
import { getGuildSettings } from '../_helpers';
import { renderItemCategoryEditMenu } from './CategorySelectMenu';

export const CreateCategoryButton = ButtonComponent({
  async handle() {
    await this.deferUpdate();

    const category = await prisma.category.create({
      data: {
        id: dateToSnowflake(new Date()),
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
