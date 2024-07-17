import { emojis } from '$lib/env';
import { getEmojiURL } from '$lib/functions/getEmojiURL';
import { t } from '$lib/language';
import { EditableGuildFeatures } from '$lib/types/guild-settings';
import { Category, Item } from '@prisma/client';
import dedent from 'dedent';
import { Interaction } from 'discord.js';
import { SelectMenuComponent, components, row } from 'purplet';
import { currencyFormat, formatItemType, formatItemValue } from '../../../economy/_helpers';
import { ItemSelectMenu } from '../../../economy/shop/ItemSelectMenu';
import { getGuildSettings, getGuildSettingsHeader } from '../_helpers';
import { CreateItemPart1 } from './CreateItem1Info';
import { ShopButton } from './MenuShop';
import { EditCategoryButton } from './EditCategoryButton';

export const CategorySelectMenu = SelectMenuComponent({
  async handle(ctx: null) {
    const id = this.values[0];
    const { economy } = await getGuildSettings(this.guildId);
    const category = economy.categories.find((c) => c.id === id);

    await this.update(await renderItemCategoryEditMenu.call(this, category));
  },
});

export async function renderItemCategoryEditMenu(
  this: Interaction,
  category: Category & {
    items: Item[];
  },
) {
  const settings = await getGuildSettings(this.guildId);
  const { economy } = settings;

  return {
    embeds: [
      {
        ...getGuildSettingsHeader(
          this.guild,
          settings,
          this.locale,
          t(this, EditableGuildFeatures.economy),
          'Shop',
          category.label,
        ),
        description: category.items.length
          ? ''
          : "This category doesn't have any items yet. Create one using the button below.",
        fields: category.items.map((i) => ({
          name: `${i.emoji} ${i.name}`,
          value: dedent`
          ${formatItemType(i.type, this.locale)}: ${formatItemValue(i.type, i.value)}
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
        new ShopButton().setEmoji(emojis.buttons.left_arrow).setStyle('SECONDARY'),
        new EditCategoryButton(category.id)
          .setLabel('Edit Details')
          .setStyle('PRIMARY')
          .setEmoji(emojis.buttons.edit),
        new CreateItemPart1(category.id)
          .setLabel('Create Item')
          .setStyle('PRIMARY')
          .setEmoji(emojis.buttons.add),
      ),
      row(
        new ItemSelectMenu('edit' as never)
          .setPlaceholder('View, edit or delete an item')
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
                  description: `${i.type} • ${currencyFormat(i.price, economy, this.locale, {
                    withoutSymbol: true,
                  })}`,
                })),
          ),
      ),
    ),
  };
}
