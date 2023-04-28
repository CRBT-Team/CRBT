import { getColor } from '$lib/functions/getColor';
import { Interaction, MessageButton } from 'discord.js';
import { ButtonComponent, components, row } from 'purplet';
import { getGuildSettings } from '../../settings/serverSettings/_helpers';
import { EconomyCommand } from '../_helpers';
import { CategorySelectMenu, renderCategoryShopPage } from './CategorySelectMenu';

export const shop: EconomyCommand = {
  getMeta() {
    return {
      name: 'shop',
      description: "Access the server's Shop and purchase items!",
    };
  },
  async handle() {
    await this.deferReply({
      ephemeral: true,
    });

    await this.editReply(await renderShopFrontPage.call(this));
  },
};

export async function renderShopFrontPage(this: Interaction) {
  const { economy } = await getGuildSettings(this.guildId);

  return {
    embeds: [
      {
        author: {
          name: `${this.guild.name} - Shop`,
          icon_url: this.guild.iconURL(),
        },
        description: 'lorem ipsum dolor sit amet and whatever they put here idk',
        image: {
          url: 'https://m.clembs.com/placeholder-image.png',
        },
        color: await getColor(this.guild),
      },
    ],
    components: components(
      row(
        new MessageButton().setCustomId('recents').setLabel('Recently added').setStyle('PRIMARY'),
        new MessageButton().setCustomId('best').setLabel('Top sellers').setStyle('PRIMARY')
      ),
      row(
        new CategorySelectMenu().setPlaceholder('Categories').setOptions(
          economy.categories.map((c) => ({
            label: c.label,
            emoji: c.emoji,
            description: `${c.items.length.toLocaleString(this.locale)} items`,
            value: c.id.toString(),
          }))
        )
      )
    ),
  };
}

export const BackButton = ButtonComponent({
  async handle(categoryId: number | undefined) {
    if (categoryId) {
      const { economy } = await getGuildSettings(this.guildId);
      const category = economy.categories.find((c) => c.id === categoryId);

      return await this.update(await renderCategoryShopPage.call(this, category, economy));
    }

    await this.update(await renderShopFrontPage.call(this));
  },
});
