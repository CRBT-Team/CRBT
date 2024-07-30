import { emojis } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { slashCmd } from '$lib/functions/commandMention';
import { formatUsername } from '$lib/functions/formatUsername';
import { getColor } from '$lib/functions/getColor';
import { Interaction } from 'discord.js';
import { ButtonComponent, components, row } from 'purplet';
import {
  EconomyCommand,
  formatItemType,
  formatItemValue,
  getServerMember,
  itemTypes,
} from '../_helpers';
import { GoToPageButton } from './GoToPageButton';
import { ItemSelectMenu } from './Item';
import { invisibleChar } from '$lib/util/invisibleChar';
import { ShopGoToButton } from '../shop/shop';
import { FullGuildMember } from '$lib/types/member';

export const inventory: EconomyCommand = {
  getMeta() {
    return {
      name: 'inventory',
      description: 'View and equip your items.',
    };
  },
  async handle() {
    await this.deferReply({
      ephemeral: true,
    });

    const member = await getServerMember(this.user.id, this.guildId);

    await this.editReply(await renderInventory.call(this, member));
  },
};

export async function renderInventory(this: Interaction, member: FullGuildMember, page = 0) {
  const items = member?.items?.slice(page * 10, (page + 1) * 10) || [];
  const pages = Math.ceil((member?.items?.length || 0) / 3) - 1;

  return {
    content: this instanceof ButtonComponent ? invisibleChar : undefined,
    embeds: [
      {
        author: {
          name: `${formatUsername(this.user)} - Inventory`,
          icon_url: avatar(this.user),
        },
        description: !items.length
          ? `Nothing in your inventory. Buy objects from ${this.guild.name}'s ${slashCmd('shop')}`
          : 'Select an item using the dropdown menu to see info or use it.',
        fields: items.map(({ equipped, item }) => {
          const hasValue = itemTypes[item.type].hasValue;

          return {
            name: `${item.emoji} ${item.name} ${hasValue && equipped ? '(Equipped)' : '(Not Equipped)'}`,
            value: `${formatItemType(item.type, this.locale)}: ${formatItemValue(item.type, item.value)}`,
            inline: true,
          };
        }),
        color: await getColor(this.user),
      },
    ],
    components: components(
      row(
        new ItemSelectMenu()
          .setOptions(
            member.items.length
              ? member.items.map(({ item, equipped }) => {
                  return {
                    label: `${item.name} ${equipped ? '(Equipped)' : ''}`,
                    emoji: item.emoji,
                    value: item.id,
                  };
                })
              : [
                  {
                    label: 'No items',
                    value: 'null',
                  },
                ],
          )
          .setDisabled(!items.length),
      ),
      row(
        new GoToPageButton({ page: 0 })
          .setEmoji(emojis.buttons.skip_first)
          .setStyle('PRIMARY')
          .setDisabled(page === 0),
        new GoToPageButton({ page: page - 1, s: true })
          .setEmoji(emojis.buttons.left_arrow)
          .setStyle('PRIMARY')
          .setDisabled(page === 0),
        new GoToPageButton({ page: page + 1 })
          .setEmoji(emojis.buttons.right_arrow)
          .setStyle('PRIMARY')
          .setDisabled(page >= pages),
        new GoToPageButton({ page: pages, s: false })
          .setEmoji(emojis.buttons.skip_last)
          .setStyle('PRIMARY')
          .setDisabled(page >= pages),
      ),
      row(new ShopGoToButton({ menu: 'topSellers' }).setLabel('Open Shop').setStyle('SECONDARY')),
    ),
  };
}

//TODO: add renderInventoryItem
