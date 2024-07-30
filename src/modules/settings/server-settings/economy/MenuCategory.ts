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
import { renderArchivedCategory } from './MenuArchivedCategory';
import { invisibleChar } from '$lib/util/invisibleChar';
import { ArchiveCategoryButton, UnarchiveButton } from './ArchiveCategoryButton';

export const CategorySelectMenu = SelectMenuComponent({
  async handle(ctx: null) {
    const id = this.values[0];
    const { economy } = await getGuildSettings(this.guildId);

    if (id === 'archived') {
      return this.update(await renderArchivedCategory.call(this));
    }

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
  const settings = await getGuildSettings(this.guildId, true);
  const { economy } = settings;

  const items = category.items.filter(({ archived }) => !archived);
  const archivedItems = category.items.filter(({ archived }) => archived);

  return {
    content: invisibleChar,
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
        description:
          (items.length
            ? ''
            : "This category doesn't have any items yet. Create one using the button below.") +
          (archivedItems.length
            ? `\n\n${category.items.length - items.length} archived items. View them in the "Archived" category.`
            : ''),
        fields: items.map((i) => ({
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
        new ItemSelectMenu('edit' as never)
          .setPlaceholder('View, edit or delete an item')
          .setDisabled(!items.length || category.archived)
          .setOptions(
            !items.length
              ? [
                  {
                    label: 'nothing to see here 👀',
                    value: 'null',
                  },
                ]
              : items.map((i) => ({
                  label: i.name,
                  emoji: i.emoji,
                  value: i.id.toString(),
                  description: `${formatItemType(i.type, this.locale)}: ${currencyFormat(
                    i.price,
                    economy,
                    this.locale,
                    {
                      withoutSymbol: true,
                    },
                  )}`,
                })),
          ),
      ),
      row(
        new ShopButton().setEmoji(emojis.buttons.left_arrow).setStyle('SECONDARY'),
        new EditCategoryButton(category.id)
          .setLabel('Edit Details')
          .setStyle('PRIMARY')
          .setEmoji(emojis.buttons.edit)
          .setDisabled(category.archived),
        new CreateItemPart1(category.id)
          .setLabel('Create Item')
          .setStyle('PRIMARY')
          .setEmoji(emojis.buttons.add)
          .setDisabled(category.archived || category.items.length >= 25),
        category.archived
          ? new UnarchiveButton(category.id).setLabel('Unarchive Category').setStyle('SUCCESS')
          : new ArchiveCategoryButton(category.id).setLabel('Archive Category').setStyle('DANGER'),
      ),
    ),
  };
}
