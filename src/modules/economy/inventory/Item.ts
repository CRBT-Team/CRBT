import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { emojis } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { formatUsername } from '$lib/functions/formatUsername';
import { MessageComponentInteraction, MessageEditOptions } from 'discord.js';
import { ButtonComponent, SelectMenuComponent, components, row } from 'purplet';
import { getGuildSettings } from '../../settings/server-settings/_helpers';
import { ItemType, formatItemType, formatItemValue, getServerMember, itemTypes } from '../_helpers';
import { GoToPageButton } from './GoToPageButton';
import { FullGuildMember, MemberItem } from '$lib/types/member';

export async function renderInventoryItem(
  this: MessageComponentInteraction,
  { item, equipped }: MemberItem,
  member: FullGuildMember,
): Promise<MessageEditOptions> {
  const hasValue = itemTypes[item.type].hasValue;

  return {
    embeds: [
      {
        author: {
          name: `${formatUsername(this.user)} - Inventory`,
          iconURL: avatar(this.user, 64),
        },
        title: `${item.emoji} ${item.name} ${hasValue && equipped ? '(Equipped)' : ''}`,
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
          member.items.map(({ equipped: e, item: i }) => {
            return {
              label: `${i.name} ${e ? '(Equipped)' : ''}`,
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
                newState: !equipped,
              })
                .setLabel(equipped ? 'Unequip' : 'Equip')
                .setStyle(equipped ? 'DANGER' : 'SUCCESS'),
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
    const item = member.items.find(({ item }) => item.id === itemId);

    await this.update(await renderInventoryItem.call(this, item, member));
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
            items: {
              update: {
                data: {
                  equipped: newState,
                },
                where: {
                  id: `${itemId}_${this.user.id}_${this.guildId}`,
                },
              },
            },
          },
          where: {
            id: `${this.user.id}_${this.guildId}`,
          },
          include: {
            items: {
              include: { item: true },
            },
          },
        }),
      true,
    );

    console.log(newMember.items);

    await this.editReply(
      await renderInventoryItem.call(
        this,
        newMember.items.find((i) => i.id === itemId),
        newMember,
      ),
    );
  },
});
