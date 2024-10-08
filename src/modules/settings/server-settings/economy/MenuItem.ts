import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { emojis } from '$lib/env';
import { getColor } from '$lib/functions/getColor';
import { getEmojiURL } from '$lib/functions/getEmojiURL';
import { t } from '$lib/language';
import { EditableGuildFeatures } from '$lib/types/guild-settings';
import { Item } from '@prisma/client';
import { timestampMention } from '@purplet/utils';
import dedent from 'dedent';
import { EmbedFieldData, Interaction, MessageButton } from 'discord.js';
import { ButtonComponent, components, row } from 'purplet';
import { ItemType, currencyFormat, getServerMember } from '../../../economy/_helpers';
import { BuyItemButton } from '../../../economy/shop/BuyItemButton';
import { ShopGoToButton } from '../../../economy/shop/shop';
import { CancelItemCreateButton } from './CancelItemCreateButton';
import { EditItemAvailabilityButton } from './EditItemAvailabilityButton';
import { EditItemInfoButton } from './EditItemInfoButton';
import { getGuildSettings, getGuildSettingsHeader } from '../_helpers';
import { GoToPageButton } from '../../../economy/inventory/GoToPageButton';
import { DeleteItemButton } from './DeleteItemButton';
import { invisibleChar } from '$lib/util/invisibleChar';
import { ArchiveItemButton, UnarchiveButton } from './ArchiveItemButton';
import { ArchivedCategoryButton } from './MenuArchivedCategory';

export async function renderItem(
  this: Interaction,
  item: Item,
  mode: 'edit' | 'shop',
  archivedBack?: 'category' | 'all-categories',
) {
  const settings = await getGuildSettings(this.guildId, true);

  const { economy } = settings;
  const fullItem = await fetchWithCache(`economyItem:${item.id}`, () =>
    prisma.item.findFirst({
      where: { id: item.id },
      include: { members: true },
    }),
  );
  const userHasItem = !!fullItem.members.find((m) => m.memberId.startsWith(this.user.id));
  const member = await getServerMember(this.user.id, this.guildId);
  const category = economy.categories.find((c) => c.id === item.categoryId);

  const fields: EmbedFieldData[] = [
    {
      name: 'Price',
      value:
        currencyFormat(item.price, economy, this.locale) +
        (mode === 'shop'
          ? ` (Your balance: ${currencyFormat(member?.money || 0, economy, this.locale, {
              zeroEqualsFree: false,
            })})`
          : ''),
      inline: true,
    },
  ];

  switch (item.type) {
    case ItemType.COSMETIC: {
      fields.push({
        name: 'Value',
        value: `Cosmetic`,
      });
      break;
    }
    case ItemType.ROLE: {
      fields.push({
        name: 'Value',
        value: `Role: <@&${item.value}>`,
      });
      break;
    }
    case ItemType.INCOME_MULTIPLIER: {
      fields.push({
        name: 'Value',
        value: `Income multiplier: x${item.value}`,
      });
      break;
    }
    case ItemType.OTHER: {
      fields.push({
        name: 'Value',
        value: item.value,
      });
      break;
    }
  }

  if (mode === 'edit') {
    fields.push({
      name: 'Stats',
      value: `Purchased by ${fullItem.members.length} member(s) • Equipped by ${fullItem.members.filter(({ equipped }) => !!equipped).length} member(s)`,
    });
  }

  fields.push({
    name: 'Availability',
    value:
      mode === 'shop' && userHasItem
        ? '**Bought**'
        : item.availableUntil && item.availableUntil < new Date()
          ? '**Expired**'
          : item.stock === 0
            ? '**Out of stock**'
            : dedent`
        ${item.stock === null ? 'Unlimited stock' : `${item.stock} remaining in stock`} • ${
          item.availableUntil
            ? `**Available until ${timestampMention(item.availableUntil, 'R')}**`
            : 'Always available for purchase'
        }`,
  });

  const header =
    mode === 'edit'
      ? getGuildSettingsHeader(
          this.guild,
          settings,
          this.locale,
          t(this, EditableGuildFeatures.economy),
          category.label,
          item.name,
        )
      : {
          author: {
            name: `${this.guild.name} - Shop`,
            icon_url: this.guild.iconURL(),
          },
          title: item.name,
          color: await getColor(this.guild),
        };

  return {
    content: invisibleChar,
    embeds: [
      {
        ...header,
        description: item.description,
        fields,
        thumbnail: item.emoji ? { url: getEmojiURL(item.emoji) } : null,
        image: item.type === ItemType.COSMETIC ? { url: item.value } : null,
      },
    ],
    components: components(
      row().addComponents(
        ...(mode === 'edit'
          ? [
              new EditItemInfoButton({ id: item.id, mode: 'edit' })
                .setStyle('PRIMARY')
                .setLabel(`Edit Information`)
                .setEmoji(emojis.buttons.edit)
                .setDisabled(item.archived),
              new EditItemAvailabilityButton({ id: item.id, mode: 'edit' })
                .setStyle('PRIMARY')
                .setLabel(`Edit Availability`)
                .setEmoji(emojis.buttons.edit)
                .setDisabled(item.archived),
              fullItem.archived
                ? new UnarchiveButton(item.id).setStyle('SUCCESS').setLabel('Unarchive Item')
                : fullItem.members.length
                  ? new ArchiveItemButton(item.id).setStyle('DANGER').setLabel('Archive Item')
                  : new DeleteItemButton(item.id)
                      .setStyle('DANGER')
                      .setLabel('Delete Item')
                      .setEmoji(emojis.buttons.trash),
            ]
          : [
              new ShopGoToButton({ menu: 'topSellers' })
                .setEmoji(emojis.buttons.left_arrow)
                .setStyle('SECONDARY'),
              userHasItem
                ? new GoToPageButton({
                    page: 0,
                  })
                    .setLabel('In inventory')
                    .setStyle('SECONDARY')
                : item.stock !== null && item.stock <= 0
                  ? new MessageButton()
                      .setLabel('Out of stock')
                      .setCustomId('outofstocklolsosad')
                      .setStyle('SECONDARY')
                      .setDisabled()
                  : new BuyItemButton(item.id)
                      .setLabel(
                        `Purchase - ${currencyFormat(item.price, economy, this.locale, {
                          withoutSymbol: true,
                        })}`,
                      )
                      .setEmoji(economy.currencySymbol)
                      .setStyle('PRIMARY')
                      .setDisabled(item.price > (member?.money || 0)),
            ]),
      ),
      ...(mode === 'edit'
        ? [
            row(
              item.archived
                ? new ArchivedCategoryButton({
                    categoryId: archivedBack === 'category' ? item.categoryId : null,
                  })
                    .setEmoji(emojis.buttons.left_arrow)
                    .setStyle('SECONDARY')
                : new CancelItemCreateButton(category.id)
                    .setEmoji(emojis.buttons.left_arrow)
                    .setStyle('SECONDARY'),
            ),
          ]
        : []),
    ),
  };
}

export const ItemButton = ButtonComponent({
  async handle({ itemId, mode }: { itemId: string; mode: 'edit' | 'shop' }) {
    await this.deferUpdate();

    const { economy } = await getGuildSettings(this.guildId);
    const item = economy.items.find((i) => i.id === itemId);

    await this.editReply(await renderItem.call(this, item, mode));
  },
});
