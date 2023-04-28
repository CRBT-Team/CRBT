import { emojis } from '$lib/env';
import { getColor } from '$lib/functions/getColor';
import { getEmojiURL } from '$lib/functions/getEmojiURL';
import { t } from '$lib/language';
import { EditableGuildFeatures, FullGuildSettings } from '$lib/types/guild-settings';
import { EconomyItem, EconomyItemCategory } from '@prisma/client';
import dedent from 'dedent';
import { Interaction } from 'discord.js';
import { components, row, SelectMenuComponent } from 'purplet';
import { ItemSelectMenu } from '../../../src/modules/economy/shop/ItemSelectMenu';
import { currencyFormat, formatItemValue } from '../../../src/modules/economy/_helpers';
import {
  getGuildSettings,
  getGuildSettingsHeader,
} from '../../../src/modules/settings/server-settings/_helpers';
import { CreateItemPart1 } from './CreateItemPart1';
import { EditCategoriesButton } from './EditCategoriesButton';
import { EditCategoryButton } from './EditCategoryButton';

export const CategorySelectMenu = SelectMenuComponent({
  async handle(ctx: null) {
    const id = parseInt(this.values[0]);
    const { economy } = await getGuildSettings(this.guildId);
    const category = economy.categories.find((c) => c.id === id);

    await this.update(await renderItemCategoryEditMenu.call(this, category, economy));
  },
});

export async function renderItemCategoryEditMenu(
  this: Interaction,
  category: EconomyItemCategory & {
    items: EconomyItem[];
  },
  economy: FullGuildSettings['economy']
) {
  return {
    embeds: [
      {
        ...getGuildSettingsHeader(this.locale, await getColor(this.guild), [
          this.guild.name,
          t(this, EditableGuildFeatures.economy),
          category.label,
        ]),
        fields: category.items.map((i) => ({
          name: `${i.icon} ${i.name}`,
          value: dedent`
          ${i.type}: ${formatItemValue(i.type, i.value)}
          **${currencyFormat(i.price, economy, this.locale)}**`,
        })),
        thumbnail: category.emoji
          ? {
              url: getEmojiURL(category.emoji),
            }
          : null,
      },
    ],
    components: components(
      row(
        new EditCategoriesButton().setEmoji(emojis.buttons.left_arrow).setStyle('SECONDARY'),
        new EditCategoryButton(category.id)
          .setLabel(t(this, 'EDIT'))
          .setStyle('PRIMARY')
          .setEmoji(emojis.buttons.pencil),
        new CreateItemPart1(category.id).setLabel('Create Item').setStyle('PRIMARY')
      ),
      row(
        new ItemSelectMenu('edit' as never)
          .setPlaceholder('Items')
          .setDisabled(!category.items.length)
          .setOptions(
            !category.items.length
              ? [
                  {
                    label: 'nothing to see here 👀',
                    value: 'null',
                  },
                ]
              : category.items.map((i) => ({
                  label: i.name,
                  emoji: i.icon,
                  value: i.id.toString(),
                  description: `${i.type} • ${currencyFormat(i.price, economy, this.locale)}`,
                }))
          )
      )
    ),
  };
}
