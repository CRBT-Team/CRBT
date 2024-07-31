import { getColor } from '$lib/functions/getColor';
import { ButtonComponent, components, row } from 'purplet';
import { getGuildSettings } from '../../settings/server-settings/_helpers';
import { Interaction, MessageButton } from 'discord.js';
import { prisma } from '$lib/db';
import { currencyFormat } from '../_helpers';
import { ItemSelectMenu } from './ItemSelectMenu';
import { invisibleChar } from '$lib/util/invisibleChar';
import { hasPerms } from '$lib/functions/hasPerms';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ShopButton } from '../../settings/server-settings/economy/MenuShop';
import { TopSellersButton } from './TopSellers';

export async function renderShopRecentlyAdded(this: Interaction) {
  const { economy } = await getGuildSettings(this.guildId);

  const items = await prisma.item.findMany({
    where: {
      guildId: this.guildId,
      archived: false,
      category: {
        archived: false,
      },
    },
    orderBy: {
      id: 'desc',
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
          name: this.guild.name,
          icon_url: this.guild.iconURL(),
        },
        title: 'Shop - Recently Added',
        description: 'The latest items in the Shop.',
        fields: items.map((i) => ({
          name:
            `${i.emoji} ${i.name}` +
            (i.members.find((o) => o.memberId.includes(this.user.id))
              ? ' (Owned)'
              : i.stock === 0
                ? ' (Out of stock)'
                : i.stock !== null && i.stock <= 5
                  ? ` (Only ${i.stock} in stock)`
                  : i.availableUntil
                    ? ` (Limited edition)`
                    : ''),
          value: currencyFormat(i.price, economy, this.locale),
        })),
        color: await getColor(this.guild),
      },
    ],
    components: components(
      row(
        new TopSellersButton().setEmoji('🔥').setLabel('Top Sellers').setStyle('PRIMARY'),
        new RecentlyAddedButton()
          .setEmoji('🕒')
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
      ),
      ...(hasPerms(this.memberPermissions, PermissionFlagsBits.ManageGuild)
        ? [row(new ShopButton().setLabel('Shop Settings').setStyle('SECONDARY'))]
        : []),
    ),
  };
}

export const RecentlyAddedButton = ButtonComponent({
  async handle() {
    await this.update(await renderShopRecentlyAdded.call(this));
  },
});
