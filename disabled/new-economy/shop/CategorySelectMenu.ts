import { emojis } from '$lib/env';
import { getColor } from '$lib/functions/getColor';
import { getEmojiURL } from '$lib/functions/getEmojiURL';
import { FullGuildSettings } from '$lib/types/guild-settings';
import { EconomyItem, EconomyItemCategory } from '@prisma/client';
import { Interaction } from 'discord.js';
import { components, row, SelectMenuComponent } from 'purplet';
import { getGuildSettings } from '../../../src/modules/settings/server-settings/_helpers';
import { ItemSelectMenu } from './ItemSelectMenu';
import { BackButton } from './shop';
import { renderItemEmbedField } from './_helpers';

export const CategorySelectMenu = SelectMenuComponent({
  async handle(ctx: null) {
    const id = parseInt(this.values[0]);
    const { economy } = await getGuildSettings(this.guildId);
    const category = economy.categories.find((c) => c.id === id);

    await this.update(await renderCategoryShopPage.call(this, category, economy));
  },
});

export async function renderCategoryShopPage(
  this: Interaction,
  category: EconomyItemCategory & {
    items: EconomyItem[];
  },
  economy: FullGuildSettings['economy']
) {
  return {
    embeds: [
      {
        author: {
          name: `${this.guild.name} - Shop`,
          icon_url: this.guild.iconURL(),
        },
        title: category.label,
        fields: category.items.map((i) => renderItemEmbedField(i, economy, this.locale)),
        color: await getColor(this.guild),
        thumbnail: { url: getEmojiURL(category.emoji) },
      },
    ],
    components: components(
      row(
        new ItemSelectMenu('shop' as never).setOptions(
          category.items.map((i) => ({
            label: i.name,
            emoji: i.icon,
            value: i.id.toString(),
          }))
        )
      ),
      row(new BackButton(undefined).setEmoji(emojis.buttons.left_arrow).setStyle('SECONDARY'))
    ),
  };
}
