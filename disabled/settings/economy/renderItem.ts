import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { emojis } from '$lib/env';
import { getColor } from '$lib/functions/getColor';
import { getEmojiURL } from '$lib/functions/getEmojiURL';
import { t } from '$lib/language';
import { EditableGuildFeatures, FullGuildSettings } from '$lib/types/guild-settings';
import { EconomyItem, ItemTypes } from '@prisma/client';
import { timestampMention } from '@purplet/utils';
import dedent from 'dedent';
import { EmbedFieldData, Interaction, MessageButton } from 'discord.js';
import { components, row } from 'purplet';
import { BuyItemButton } from '../../../src/modules/economy/shop/BuyItemButton';
import { BackButton } from '../../../src/modules/economy/shop/shop';
import { currencyFormat } from '../../../src/modules/economy/_helpers';
import { getGuildSettingsHeader } from '../../../src/modules/settings/server-settings/_helpers';
import { CancelItemCreateButton } from './CancelItemCreateButton';
import { EditItemAvailabilityButton } from './EditItemAvailabilityButton';
import { EditItemInfoButton } from './EditItemInfoButton';

export async function renderItem(
  this: Interaction,
  item: EconomyItem,
  economy: FullGuildSettings['economy'],
  mode: 'edit' | 'shop'
) {
  const fullItem = await fetchWithCache(`economyItem:${item.id}`, () =>
    prisma.economyItem.findFirst({
      where: { id: item.id },
      include: { owners: true, activeMembers: true },
    })
  );
  const userHasItem = !!fullItem.owners.find((m) => m.userId === this.user.id);
  console.log(fullItem);
  const category = economy.categories.find((c) => c.id === item.categoryId);
  const fields: EmbedFieldData[] = [
    {
      name: 'Price',
      value: currencyFormat(item.price, economy, this.locale),
      inline: true,
    },
  ];

  switch (item.type) {
    case ItemTypes.COSMETIC: {
      fields.push({
        name: 'Value',
        value: `Cosmetic (see image below)`,
      });
      break;
    }
    case ItemTypes.ROLE: {
      fields.push({
        name: 'Value',
        value: `Role: <@&${item.value}>`,
      });
      break;
    }
    case ItemTypes.INCOME_MULTIPLIER: {
      fields.push({
        name: 'Value',
        value: `Income multiplier: x${item.value}`,
      });
      break;
    }
    case ItemTypes.OTHER: {
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
      value: `Purchased by ${fullItem.owners.length} members • Used by ${fullItem.activeMembers.length} members`,
    });
  }

  fields.push({
    name: 'Availability',
    value:
      mode === 'shop' && userHasItem
        ? '**Bought**'
        : dedent`
      ${item.stock ? `${item.stock} remaining in stock` : 'Unlimited stock'} • ${
            item.availableUntil
              ? `**Available until ${timestampMention(item.availableUntil, 'R')}**`
              : 'Available for purchase'
          }`,
  });

  const header =
    mode === 'edit'
      ? getGuildSettingsHeader(this.locale, await getColor(this.guild), [
          this.guild.name,
          t(this, EditableGuildFeatures.economy),
          category.label,
          item.name,
        ])
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
        thumbnail: item.icon ? { url: getEmojiURL(item.icon) } : null,
        image: item.type === ItemTypes.COSMETIC ? { url: item.value } : null,
      },
    ],
    components: components(
      row().addComponents(
        ...(mode === 'edit'
          ? [
              new EditItemInfoButton({ id: item.id, mode: 'edit' })
                .setStyle('PRIMARY')
                .setLabel(`Information`)
                .setEmoji(emojis.buttons.pencil),
              new EditItemAvailabilityButton({ id: item.id, mode: 'edit' })
                .setStyle('PRIMARY')
                .setLabel(`Information`)
                .setEmoji(emojis.buttons.pencil),
            ]
          : [
              new BackButton(item.categoryId)
                .setEmoji(emojis.buttons.left_arrow)
                .setStyle('SECONDARY'),
              userHasItem
                ? //TODO: work on this
                  new MessageButton()
                    .setCustomId('todo')
                    .setDisabled()
                    .setLabel('In inventory')
                    .setStyle('SECONDARY')
                : new BuyItemButton(item.id)
                    .setLabel(
                      `Buy - ${currencyFormat(item.price, economy, this.locale, {
                        withoutSymbol: true,
                      })}`
                    )
                    .setEmoji(economy.currencySymbol)
                    .setStyle('PRIMARY'),
            ])
      ),
      row(
        new CancelItemCreateButton(category.id)
          .setEmoji(emojis.buttons.left_arrow)
          .setStyle('SECONDARY')
      )
    ),
  };
}
