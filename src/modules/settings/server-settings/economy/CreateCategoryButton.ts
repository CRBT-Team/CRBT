import { prisma } from '$lib/db';
import { dateToSnowflake } from '@purplet/utils';
import { ButtonComponent } from 'purplet';
import { renderItemCategoryEditMenu } from './MenuCategory';
import { defaultGuildSettings } from '../_helpers';
import { FullGuildSettings } from '$lib/types/guild-settings';

export const CreateCategoryButton = ButtonComponent({
  async handle() {
    await this.deferUpdate();

    const category = await prisma.category.create({
      data: {
        id: dateToSnowflake(new Date()),
        label: 'New Category',
        emoji: '📁',
        economy: {
          connectOrCreate: {
            where: { id: this.guildId },
            create: {
              id: this.guildId,
              ...(({ id, items, categories, ...o }: FullGuildSettings['economy']) => o)(
                defaultGuildSettings.economy,
              ),
            },
          },
        },
      },
      include: { items: true },
    });

    await this.editReply(await renderItemCategoryEditMenu.call(this, category));
  },
});
