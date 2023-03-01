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
import { components, SelectMenuComponent } from 'purplet';
import { currencyFormat } from '../../../economy/_helpers';
import { getSettings, getSettingsHeader } from '../_helpers';
import { EditCategoryButton } from './EditCategoryButton';

export const ItemSelectMenu = SelectMenuComponent({
  async handle(ctx: null) {
    const id = parseInt(this.values[0]);
    const { economy } = await getSettings(this.guildId);
    const item = economy.items.find((i) => i.id === id);

    await this.update(await renderItem.call(this, item, economy));
  },
});

export async function renderItem(
  this: Interaction,
  item: EconomyItem,
  economy: FullSettings['economy']
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
      name: 'Availability',
      value: dedent`
      ${item.stock} in stock
      ${
        item.availableUntil ? `Available until ${timestampMention(item.availableUntil, 'R')}` : ''
      }`,
      inline: true,
    },
    {
      name: 'Price',
      value: !item.price ? 'Free' : currencyFormat(item.price, economy, this.locale),
      inline: true,
    },
    {
      name: 'Stats',
      value: dedent`
      Purchases: ${fullItem.owners.length}
      Actively using: ${fullItem.activeMembers.length}
      `,
      inline: true,
    },
  ];

  switch (item.type) {
    case ItemTypes.COSMETIC: {
      fields.push({
        name: 'Value',
        value: `Cosmetic (see image below)`,
      });
    }
    case ItemTypes.ROLE: {
      fields.push({
        name: 'Value',
        value: `Role: <@&${item.value}>`,
      });
    }
    case ItemTypes.ROLE: {
      fields.push({
        name: 'Value',
        value: `Income multiplier: x${item.value}`,
      });
    }
    case ItemTypes.OTHER: {
      fields.push({
        name: 'Value',
        value: item.value,
      });
    }
  }

  return {
    embeds: [
      {
        ...getSettingsHeader(this.locale, await getColor(this.guild), [
          this.guild.name,
          t(this, EditableFeatures.economy),
          category.label,
          item.name,
        ]),
        description: item.description,
        fields,
        thumbnail: item.icon ? { url: getEmojiURL(item.icon) } : null,
      },
    ],
    components: components(
      new EditCategoryButton(category.id).setEmoji(emojis.buttons.left_arrow).setStyle('SECONDARY'),
      //TODO: do that
      new MessageButton()
        .setDisabled(true)
        .setStyle('PRIMARY')
        .setLabel(t(this, 'EDIT'))
        .setCustomId('todo')
    ),
  };
}
