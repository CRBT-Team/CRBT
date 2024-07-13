import { getColor } from "$lib/functions/getColor";
import { ButtonComponent, components, row } from "purplet";
import { getGuildSettings } from "../../settings/server-settings/_helpers";
import { Interaction, MessageButton } from "discord.js";
import { CategorySelectMenu } from "./CategorySelectMenu";
import { prisma } from "$lib/db";
import { renderItem } from "../inventory/Item";
import { currencyFormat, formatItemValue } from "../_helpers";
import { ItemSelectMenu } from "./ItemSelectMenu";

export async function renderShopTopSellers(this: Interaction) {
  const { economy } = await getGuildSettings(this.guildId);
  
  const items = await prisma.item.findMany({
    orderBy: {
      owners: {
        _count: 'desc'
      }
    },
    take: 10,
  });
 
  return {
    embeds: [
      {
        author: {
          name: `${this.guild.name} - Shop`,
          icon_url: this.guild.iconURL(),
        },
        title: 'Top Sellers',
        fields: items.map((i) => ({
          name: `${i.emoji} ${i.name}`,
          value: currencyFormat(i.price, economy, this.locale),
        })),
        color: await getColor(this.guild),
      },
    ],
    components: components(
      row(
        new TopSellersButton()
          .setEmoji('🔥')
          .setLabel('Top Sellers')
          .setStyle('PRIMARY')
          .setDisabled(true),
        new MessageButton()
          .setEmoji('🕒')
          .setCustomId('recents')
          .setLabel('Recently Added')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setEmoji('📚')
          .setCustomId('categories')
          .setLabel('All Categories')
          .setStyle('PRIMARY'),
      ),
      row(
        new ItemSelectMenu('shop' as never)
        .setOptions(
          items.map((i) => ({
            label: i.name,
            emoji: i.emoji,
            description: currencyFormat(i.price, economy, this.locale, {
              withoutSymbol: true,
            }),
            value: i.id.toString(),
          })),
        ).setPlaceholder('View and buy an item'),
        // new CategorySelectMenu().setPlaceholder('Categories').setOptions(
        //   economy.categories.map((c) => ({
        //     label: c.label,
        //     emoji: c.emoji,
        //     description: `${c.items.length.toLocaleString(this.locale)} items`,
        //     value: c.id.toString(),
        //   })),
        // ),
      ),
    ),
  };
}

export const TopSellersButton = ButtonComponent({
  async handle() {
    await this.update(await renderShopTopSellers.call(this));
  }
});