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
import { components, row } from 'purplet';
import { ItemType, currencyFormat, getServerMember } from '../../../economy/_helpers';
import { BuyItemButton } from '../../../economy/shop/BuyItemButton';
import { ShopGoToButton } from '../../../economy/shop/shop';
import { CancelItemCreateButton } from './CancelItemCreateButton';
import { EditItemAvailabilityButton } from './EditItemAvailabilityButton';
import { EditItemInfoButton } from './EditItemInfoButton';
import { getGuildSettings, getGuildSettingsHeader } from '../_helpers';
import { GoToPageButton } from '../../../economy/inventory/GoToPageButton';

export async function renderItem(this: Interaction, item: Item, mode: 'edit' | 'shop') {
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
          ? ` (Your balance: ${currencyFormat(member.money, economy, this.locale, {
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
        value: `Cosmetic (see image below)`,
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
                .setEmoji(emojis.buttons.edit),
              new EditItemAvailabilityButton({ id: item.id, mode: 'edit' })
                .setStyle('PRIMARY')
                .setLabel(`Edit Availability`)
                .setEmoji(emojis.buttons.edit),
            ]
          : [
              new ShopGoToButton({ categoryId: item.categoryId })
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
                      .setDisabled(item.price > member.money),
            ]),
      ),
      ...(mode === 'edit'
        ? [
            row(
              new CancelItemCreateButton(category.id)
                .setEmoji(emojis.buttons.left_arrow)
                .setStyle('SECONDARY'),
            ),
          ]
        : []),
    ),
  };
}
