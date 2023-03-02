import { emojis } from '$lib/env';
import { getColor } from '$lib/functions/getColor';
import { getEmojiURL } from '$lib/functions/getEmojiURL';
import { t } from '$lib/language';
import { EditableFeatures, FullSettings } from '$lib/types/settings';
import { EconomyItem, EconomyItemCategory } from '@prisma/client';
import { Interaction, MessageSelectMenu } from 'discord.js';
import { components, row, SelectMenuComponent } from 'purplet';
import { currencyFormat } from '../../../economy/_helpers';
import { getSettings, getSettingsHeader } from '../_helpers';
import { CreateItemPart1 } from './CreateItemPart1';
import { EditCategoriesButton } from './EditCategoriesButton';
import { EditCategoryButton } from './EditCategoryButton';

export const CategorySelectMenu = SelectMenuComponent({
  async handle(ctx: null) {
    const id = parseInt(this.values[0]);
    const { economy } = await getSettings(this.guildId);
    const category = economy.categories.find((c) => c.id === id);

    await this.update(await renderItemCategory.call(this, category, economy));
  },
});

export async function renderItemCategory(
  this: Interaction,
  category: EconomyItemCategory & {
    items: EconomyItem[];
  },
  economy: FullSettings['economy']
) {
  return {
    embeds: [
      {
        ...getSettingsHeader(this.locale, await getColor(this.guild), [
          this.guild.name,
          t(this, EditableFeatures.economy),
          category.label,
        ]),
        fields: category.items.map((i) => ({
          name: `${i.icon} ${i.name}`,
          value: `${i.type}\n\n**${currencyFormat(i.price, economy, this.locale)}**`,
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
        new MessageSelectMenu()
          .setCustomId('todo')
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
