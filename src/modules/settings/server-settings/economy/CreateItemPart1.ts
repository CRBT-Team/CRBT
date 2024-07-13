import { emojis, icons } from '$lib/env';
import { getEmojiURL } from '$lib/functions/getEmojiURL';
import { t } from '$lib/language';
import { Item } from '@prisma/client';
import { MessageButton, MessageComponentInteraction } from 'discord.js';
import { ButtonComponent, components, row } from 'purplet';
import { currencyFormat } from '../../../economy/_helpers';
import { getGuildSettings } from '../_helpers';
import { CancelItemCreateButton } from './CancelItemCreateButton';
import { CreateItemPart2 } from './CreateItemPart2';
import { EditItemInfoButton } from './EditItemInfoButton';

export const newItemCache = new Map<string, Partial<Item>>();

export const CreateItemPart1 = ButtonComponent({
  async handle(categoryId: string) {
    await handleCreateItemPart1.call(this, categoryId);
  },
});

export async function handleCreateItemPart1(this: MessageComponentInteraction, categoryId: string) {
  await this.deferUpdate();
  const { economy, accentColor } = await getGuildSettings(this.guildId);
  const buildingItem = newItemCache.get(this.message.id);

  await this.editReply({
    embeds: [
      {
        author: {
          name: `${this.guild.name} - ${t(this, 'SETTINGS_TITLE')}`,
          iconURL: icons.settings,
        },
        color: accentColor,
        title: `Create Item > ${buildingItem?.name || 'New Item'} > Information`,
        description: 'Choose a name, icon, description & price for your item.',
        fields: [
          {
            name: 'Name',
            value: buildingItem?.name ? `${buildingItem.emoji} ${buildingItem.name}` : `⚠️ Not set`,
          },
          {
            name: t(this, 'DESCRIPTION'),
            value: buildingItem?.description ?? `⚠️ Not set`,
          },
          {
            name: 'Price',
            value:
              buildingItem?.price !== undefined
                ? currencyFormat(buildingItem.price, economy, this.locale)
                : '⚠️ Not set',
          },
        ],
        thumbnail: buildingItem?.emoji ? { url: getEmojiURL(buildingItem.emoji) } : null,
      },
    ],
    components: components(
      row(
        new EditItemInfoButton({
          mode: 'setup',
          cId: categoryId,
        })
          .setLabel(t(this, 'EDIT'))
          .setEmoji(emojis.buttons.edit)
          .setStyle('PRIMARY'),
      ),
      row(
        new CancelItemCreateButton(categoryId).setLabel(t(this, 'CANCEL')).setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('whocares')
          .setDisabled()
          .setEmoji(emojis.buttons.left_arrow)
          .setStyle('SECONDARY'),
        new CreateItemPart2()
          // .setLabel(t(this, 'NEXT'))
          .setEmoji(emojis.buttons.right_arrow)
          .setStyle('PRIMARY')
          .setDisabled(!buildingItem?.name || !buildingItem?.emoji || !buildingItem?.description),
      ),
    ),
  });
}
