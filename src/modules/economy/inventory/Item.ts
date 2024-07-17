import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { emojis } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { formatUsername } from '$lib/functions/formatUsername';
import { GuildMember, Item } from '@prisma/client';
import { MessageComponentInteraction, MessageEditOptions } from 'discord.js';
import { ButtonComponent, SelectMenuComponent, components, row } from 'purplet';
import { getGuildSettings } from '../../settings/server-settings/_helpers';
import { ItemType, formatItemType, formatItemValue, getServerMember, itemTypes } from '../_helpers';
import { GoToPageButton } from './GoToPageButton';

export async function renderItem(
  this: MessageComponentInteraction,
  item: Item,
  member: GuildMember & {
    items: Item[];
    activeItems: Item[];
  },
): Promise<MessageEditOptions> {
  const hasValue = itemTypes[item.type].hasValue;
  const isActive = !!member.activeItems.find((a) => a.id === item.id);

  return {
    embeds: [
      {
        author: {
          name: `${formatUsername(this.user)} - Inventory`,
          iconURL: avatar(this.user, 64),
        },
        title: `${item.emoji} ${item.name} ${hasValue && isActive ? '(Equipped)' : ''}`,
        description: item.description,
        fields: [
          {
            name: 'Value',
            value: `${formatItemType(item.type, this.locale)}: ${formatItemValue(
              item.type,
              item.value,
            )}`,
            inline: true,
          },
        ],
        color: this.message.embeds[0].color,
      },
    ],
    components: components(
      row(
        new ItemSelectMenu().setOptions(
          member.items.map((i) => {
            const isActive = member.activeItems.find((a) => a.id === i.id);

            return {
              label: `${i.name} ${isActive ? '(Equipped)' : ''}`,
              emoji: i.emoji,
              value: i.id,
              default: i.id === item.id,
            };
          }),
        ),
      ),
      row(
        new GoToPageButton({
          page: 0,
          userId: this.user.id,
        })
          .setEmoji(emojis.buttons.left_arrow)
          .setStyle('SECONDARY'),
      ).addComponents(
        hasValue
          ? [
              new ToggleActiveItemButton({
                itemId: item.id,
                newState: !isActive,
              })
                .setLabel(isActive ? 'Unequip' : 'Equip')
                .setStyle(isActive ? 'DANGER' : 'SUCCESS'),
            ]
          : [],
      ),
    ),
  };
}

export const ItemSelectMenu = SelectMenuComponent({
  async handle(ctx: null) {
    const itemId = this.values[0];
    const member = await getServerMember(this.user.id, this.guildId);
    const item = member.items.find((i) => i.id === itemId);

    await this.update(await renderItem.call(this, item, member));
  },
});

export const ToggleActiveItemButton = ButtonComponent({
  async handle({ itemId, newState }: { itemId: string; newState: boolean }) {
    await this.deferUpdate();
    const {
      economy: { items },
    } = await getGuildSettings(this.guildId);
    const item = items.find((i) => i.id === itemId);

    switch (item.type) {
      case ItemType.ROLE: {
        const member = await this.guild.members.fetch(this.user.id);
        const role = await this.guild.roles.fetch(item.value);

        if (newState) {
          await member.roles.add(role);
        } else {
          await member.roles.remove(role);
        }
        break;
      }
    }

    const newMember = await fetchWithCache(
      `member:${this.user.id}_${this.guildId}`,
      () =>
        prisma.guildMember.update({
          data: {
            activeItems: {
              ...(newState
                ? {
                    connect: {
                      id: itemId,
                      guildId: this.guildId,
                    },
                  }
                : {
                    disconnect: {
                      id: itemId,
                      guildId: this.guildId,
                    },
                  }),
            },
          },
          where: {
            id: `${this.user.id}_${this.guildId}`,
          },
          include: {
            activeItems: true,
            items: true,
          },
        }),
      true,
    );

    console.log(newMember.activeItems);

    await this.editReply(
      await renderItem.call(
        this,
        newMember.items.find((i) => i.id === itemId),
        newMember,
      ),
    );
  },
});
