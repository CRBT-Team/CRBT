import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { emojis } from '$lib/env';
import { getColor } from '$lib/functions/getColor';
import { getEmojiURL } from '$lib/functions/getEmojiURL';
import { t } from '$lib/language';
import { EditableFeatures, FullSettings } from '$lib/types/settings';
import { EconomyItem, ItemTypes } from '@prisma/client';
import { timestampMention } from '@purplet/utils';
import dedent from 'dedent';
import { EmbedFieldData, Interaction, MessageButton } from 'discord.js';
import { components, row, SelectMenuComponent } from 'purplet';
import { BackButton } from '../../../economy/shop/shop';
import { currencyFormat } from '../../../economy/_helpers';
import { getSettings, getSettingsHeader } from '../_helpers';
import { EditCategoryButton } from './EditCategoryButton';

export const ItemSelectMenu = SelectMenuComponent({
  async handle(ctx: null) {
    const id = parseInt(this.values[0]);
    const { economy } = await getSettings(this.guildId);
    const item = economy.items.find((i) => i.id === id);

    await this.update(await renderItem.call(this, item, economy, 'edit'));
  },
});

export async function renderItem(
  this: Interaction,
  item: EconomyItem,
  economy: FullSettings['economy'],
  mode: 'edit' | 'shop'
) {
  const fullItem = await fetchWithCache(`economyItem:${item.id}`, () =>
    prisma.economyItem.findFirst({
      where: { id: item.id },
      include: { owners: true, activeMembers: true },
    })
  );
  const category = economy.categories.find((c) => c.id === item.categoryId);
  const fields: EmbedFieldData[] = [
    {
      name: 'Price',
      value: currencyFormat(item.price, economy, this.locale),
      inline: true,
    },
    {
      name: 'Availability',
      value: dedent`
      ${item.stock ? `${item.stock} remaining in stock` : 'Unlimited stock'} • ${
        item.availableUntil
          ? `**Available until ${timestampMention(item.availableUntil, 'R')}**`
          : 'Available for purchase'
      }`,
    },
  ];

  if (mode === 'edit') {
    fields.push({
      name: 'Stats',
      value: `Purchased by ${fullItem.owners.length} members • Used by ${fullItem.activeMembers.length} members`,
    });
  }

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

  const header =
    mode === 'edit'
      ? getSettingsHeader(this.locale, await getColor(this.guild), [
          this.guild.name,
          t(this, EditableFeatures.economy),
          category.label,
          item.name,
        ])
      : {
          author: {
            name: `${this.guild.name} - Shop`,
            icon_url: this.guild.iconURL(),
          },
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
      row(
        mode === 'edit'
          ? new EditCategoryButton(category.id)
              .setEmoji(emojis.buttons.left_arrow)
              .setStyle('SECONDARY')
          : new BackButton(item.categoryId)
              .setEmoji(emojis.buttons.left_arrow)
              .setStyle('SECONDARY')
      ).addComponents(
        ...(mode === 'edit'
          ? [
              //TODO: do that
              new MessageButton()
                .setDisabled(true)
                .setStyle('PRIMARY')
                .setLabel(t(this, 'EDIT'))
                .setCustomId('todo'),
            ]
          : [
              // new BuyItemButton()
              // .set
            ])
      )
    ),
  };
}
