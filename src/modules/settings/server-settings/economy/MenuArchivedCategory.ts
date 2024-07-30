import { emojis } from '$lib/env';
import { Interaction } from 'discord.js';
import { ButtonComponent, components, row } from 'purplet';
import { getGuildSettings, getGuildSettingsHeader } from '../_helpers';
import { ItemSelectMenu } from '../../../economy/shop/ItemSelectMenu';
import { t } from '$lib/language';
import { EditableGuildFeatures } from '$lib/types/guild-settings';
import { getEmojiURL } from '$lib/functions/getEmojiURL';
import dedent from 'dedent';
import { currencyFormat, formatItemType, formatItemValue } from '../../../economy/_helpers';
import { ShopButton } from './MenuShop';

export async function renderArchivedCategory(
  this: Interaction,
  page: number = 0,
  categoryId?: string,
) {
  const settings = await getGuildSettings(this.guildId, true);
  const { economy } = settings;
  const items = economy.items
    .filter((i) => !!i.archived && (categoryId ? i.categoryId === categoryId : true))
    .slice(page * 10, page * 10 + 10);

  return {
    embeds: [
      {
        ...getGuildSettingsHeader(
          this.guild,
          settings,
          this.locale,
          t(this, EditableGuildFeatures.economy),
          'Shop',
          'Archived items',
        ),
        fields: items.map((item) => ({
          name: `${item.emoji} ${item.name}`,
          value: dedent`
          ${formatItemType(item.type, this.locale)}: ${formatItemValue(item.type, item.value)}
          **${currencyFormat(item.price, economy, this.locale)}**`,
        })),
        footer: {
          text: t(this, 'PAGINATION_PAGE_OUT_OF', {
            page: (page + 1).toLocaleString(this.locale),
            pages: Math.ceil(economy.items.filter((i) => !!i.archived).length / 10).toLocaleString(
              this.locale,
            ),
          }),
        },
        thumbnail: { url: getEmojiURL('🗃️') },
      },
    ],
    components: components(
      row(
        new ItemSelectMenu('edit' as never).setPlaceholder('Select an item to view').addOptions(
          items.map((i) => ({
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
        new ShopButton()
          .setEmoji(emojis.buttons.left_arrow)
          .setLabel(t(this, 'BACK'))
          .setStyle('SECONDARY'),
        new ArchivedCategoryButton({ categoryId, page: page - 1 })
          .setStyle('PRIMARY')
          .setEmoji(emojis.buttons.left_arrow)
          .setDisabled(page === 0),
        new ArchivedCategoryButton({ categoryId, page: page + 1 })
          .setStyle('PRIMARY')
          .setEmoji(emojis.buttons.right_arrow)
          .setDisabled(page === 0),
      ),
    ),
  };
}

export const ArchivedCategoryButton = ButtonComponent({
  async handle({ categoryId, page }: { categoryId?: string; page?: number }) {
    return this.update(await renderArchivedCategory.call(this, page, categoryId));
  },
});
