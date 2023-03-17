import { emojis } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { slashCmd } from '$lib/functions/commandMention';
import { getColor } from '$lib/functions/getColor';
import { EconomyItem, ServerMember } from '@prisma/client';
import { Interaction } from 'discord.js';
import { components, row } from 'purplet';
import { EconomyCommand, formatItemValue, getServerMember } from '../_helpers';
import { GoToPageButton } from './GoToPageButton';

export const inventory: EconomyCommand = {
  getMeta() {
    return {
      name: 'inventory',
      description: 'List and use your items.',
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

export async function renderInventory(
  this: Interaction,
  member: ServerMember & { items: EconomyItem[]; activeItems: EconomyItem[] },
  page = 0
) {
  const items = member?.items?.slice(page * 10, (page + 1) * 10) || [];
  const pages = Math.ceil((member?.items?.length || 0) / 3) - 1;

  return {
    embeds: [
      {
        author: {
          name: `${this.user.tag} - Inventory`,
          icon_url: avatar(this.user),
        },
        description: !items.length
          ? `Nothing in your inventory. Buy objects from ${this.guild.name}'s ${slashCmd('shop')}`
          : 'Select an item using the dropdown menu to see info or use it.',
        fields: items.map((i) => ({
          name: `${i.icon} ${i.name}`,
          //TODO: add more to the value, like whether it's used or not
          value: `${formatItemValue(i.type, i.value)}`,
          inline: true,
        })),
        color: await getColor(this.user),
      },
    ],
    components: components(
      row(
        new GoToPageButton({ page: 0 })
          .setEmoji(emojis.buttons.skip_first)
          .setStyle('PRIMARY')
          .setDisabled(page === 0),
        new GoToPageButton({ page: page - 1, s: true })
          .setEmoji(emojis.buttons.skip_first)
          .setStyle('PRIMARY')
          .setDisabled(page === 0),
        new GoToPageButton({ page: page + 1 })
          .setEmoji(emojis.buttons.right_arrow)
          .setStyle('PRIMARY')
          .setDisabled(page >= pages),
        new GoToPageButton({ page: pages, s: true })
          .setEmoji(emojis.buttons.skip_last)
          .setStyle('PRIMARY')
          .setDisabled(page >= pages)
      )
      //TODO: add item select menu
    ),
  };
}

//TODO: add renderInventoryItem
