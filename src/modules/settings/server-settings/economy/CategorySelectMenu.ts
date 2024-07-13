import { emojis } from '$lib/env';
import { getEmojiURL } from '$lib/functions/getEmojiURL';
import { t } from '$lib/language';
import { EditableGuildFeatures, FullGuildSettings } from '$lib/types/guild-settings';
import { Category, Item } from '@prisma/client';
import dedent from 'dedent';
import { Interaction } from 'discord.js';
import { SelectMenuComponent, components, row } from 'purplet';
import { currencyFormat, formatItemValue } from '../../../economy/_helpers';
import { ItemSelectMenu } from '../../../economy/shop/ItemSelectMenu';
import { getGuildSettings } from '../_helpers';
import { CreateItemPart1 } from './CreateItemPart1';
import { EditCategoriesButton } from './EditCategoriesButton';
import { EditCategoryButton } from './EditCategoryButton';

export const CategorySelectMenu = SelectMenuComponent({
  async handle(ctx: null) {
    const id = this.values[0];
    const { economy } = await getGuildSettings(this.guildId);
    const category = economy.categories.find((c) => c.id === id);

    await this.update(await renderItemCategoryEditMenu.call(this, category, economy));
  },
});

export async function renderItemCategoryEditMenu(
  this: Interaction,
  category: Category & {
    items: Item[];
  },
  economy: FullGuildSettings['economy'],
) {
  return {
    embeds: [
      {
        title: `${t(this, EditableGuildFeatures.economy)} - ${category.label}`,

        // ...getGuildSettingsHeader(this.locale, await getColor(this.guild), [
        //   this.guild.name,
        //   category.label,
        // ]),
        fields: category.items.map((i) => ({
          name: `${i.emoji} ${i.name}`,
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
          .setEmoji(emojis.buttons.edit),
        new CreateItemPart1(category.id).setLabel('Create Item').setStyle('PRIMARY'),
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
                  emoji: i.emoji,
                  value: i.id.toString(),
                  description: `${i.type} • ${currencyFormat(i.price, economy, this.locale)}`,
                })),
          ),
      ),
    ),
  };
}
