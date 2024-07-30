import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { colors, emojis } from '$lib/env';
import { ButtonComponent, components, row } from 'purplet';
import { getGuildSettings } from '../_helpers';
import { getEmojiURL } from '$lib/functions/getEmojiURL';
import { ItemButton, renderItem } from './MenuItem';
import { t } from '$lib/language';
import dedent from 'dedent';

export const ArchiveItemButton = ButtonComponent({
  async handle(itemId: string) {
    const { economy } = await getGuildSettings(this.guildId);
    const item = economy.items.find((i) => i.id === itemId);

    await this.update({
      embeds: [
        {
          title: `Do you want to archive ${item.name}?`,
          description: dedent`This item will no longer be purchaseable.
            
            You can unarchive it at any moment by going to the "Archived" category.`,
          thumbnail: { url: getEmojiURL(item.emoji) },
          color: colors.yellow,
        },
      ],
      components: components(
        row(
          new ItemButton({ itemId, mode: 'edit' })
            .setLabel(t(this, 'CANCEL'))
            .setStyle('SECONDARY'),
          new ConfirmItemArchivingButton(itemId).setLabel(t(this, 'CONFIRM')).setStyle('DANGER'),
        ),
      ),
    });
  },
});

export const ConfirmItemArchivingButton = ButtonComponent({
  async handle(itemId: string) {
    await this.deferUpdate();

    const newItem = await fetchWithCache(
      `economyItem:${itemId}`,
      () =>
        prisma.item.update({
          where: {
            id: itemId,
          },
          data: {
            archived: true,
          },
          include: {
            members: true,
          },
        }),
      true,
    );

    await this.editReply({
      ...(await renderItem.call(this, newItem, 'edit')),
      content: `${emojis.success} Item successfully archived. Unarchive it from the "Archived" button.`,
    });
  },
});

export const UnarchiveButton = ButtonComponent({
  async handle(itemId: string) {
    await this.deferUpdate();

    const newItem = await fetchWithCache(
      `economyItem:${itemId}`,
      () =>
        prisma.item.update({
          where: {
            id: itemId,
          },
          data: {
            archived: false,
          },
          include: {
            members: true,
          },
        }),
      true,
    );

    await this.editReply(await renderItem.call(this, newItem, 'edit'));
  },
});
