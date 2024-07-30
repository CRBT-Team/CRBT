import { getColor } from '$lib/functions/getColor';
import { ButtonComponent, components, row } from 'purplet';
import { getGuildSettings } from '../../settings/server-settings/_helpers';
import { Interaction, MessageButton } from 'discord.js';
import { prisma } from '$lib/db';
import { currencyFormat } from '../_helpers';
import { ItemSelectMenu } from './ItemSelectMenu';
import { invisibleChar } from '$lib/util/invisibleChar';

export async function renderShopTopSellers(this: Interaction) {
  const { economy } = await getGuildSettings(this.guildId);

  const items = await prisma.item.findMany({
    where: {
      archived: false,
      category: {
        archived: false,
      },
    },
    orderBy: {
      members: {
        _count: 'desc',
      },
    },
    include: {
      members: {
        select: {
          memberId: true,
        },
      },
    },
    take: 5,
  });

  return {
    content: invisibleChar,
    embeds: [
      {
        author: {
          name: `${this.guild.name} - Shop`,
          icon_url: this.guild.iconURL(),
        },
        title: 'Top Sellers',
        description: 'The most popular items in the shop. Buy them while they last!',
        fields: items.map((i) => ({
          name:
            `${i.emoji} ${i.name}` +
            (i.members.find((o) => o.memberId.includes(this.user.id))
              ? ' (Owned)'
              : i.stock === 0
                ? ' (Out of stock)'
                : i.stock !== null && i.stock <= 5
                  ? ` (Only ${i.stock} in stock)`
                  : ''),
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
          .setDisabled(),
        new MessageButton()
          .setEmoji('🕒')
          .setCustomId('recents')
          .setLabel('Recently Added')
          .setStyle('PRIMARY')
          .setDisabled(),
        new MessageButton()
          .setEmoji('📚')
          .setCustomId('categories')
          .setLabel('All Categories')
          .setStyle('PRIMARY')
          .setDisabled(),
      ),
      row(
        new ItemSelectMenu('shop' as never)
          .setOptions(
            items.map((i) => ({
              label: `${i.name} ${i.stock === 0 ? '(Out of stock)' : ''}`,
              emoji: i.emoji,
              description: currencyFormat(i.price, economy, this.locale, {
                withoutSymbol: true,
              }),
              value: i.id.toString(),
            })),
          )
          .setPlaceholder('View or buy an item'),
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
  },
});
