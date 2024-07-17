import { emojis, icons } from '$lib/env';
import { getEmojiURL } from '$lib/functions/getEmojiURL';
import { t } from '$lib/language';
import { Item } from '@prisma/client';
import { MessageButton, MessageComponentInteraction, ModalSubmitInteraction } from 'discord.js';
import { ButtonComponent, components, row } from 'purplet';
import { currencyFormat } from '../../../economy/_helpers';
import { getGuildSettings, getGuildSettingsHeader } from '../_helpers';
import { CancelItemCreateButton } from './CancelItemCreateButton';
import { CreateItemPart2 } from './CreateItem2Value';
import { EditItemInfoButton } from './EditItemInfoButton';
import { EditableGuildFeatures } from '$lib/types/guild-settings';

export const newItemCache = new Map<string, Partial<Item>>();

export const CreateItemPart1 = ButtonComponent({
  async handle(categoryId: string) {
    await handleCreateItemPart1.call(this, categoryId);
  },
});

export async function handleCreateItemPart1(
  this: MessageComponentInteraction | ModalSubmitInteraction,
  categoryId: string,
) {
  await this.deferUpdate();
  const settings = await getGuildSettings(this.guildId);
  const { economy } = settings;
  const buildingItem = newItemCache.get(this.message.id);

  await this.editReply({
    embeds: [
      {
        ...getGuildSettingsHeader(
          this.guild,
          settings,
          this.locale,
          t(this, EditableGuildFeatures.economy),
          'Shop',
          'Create Item',
        ),
        title: `${buildingItem?.name || 'New Item'} - Information`,
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
          .setLabel(buildingItem?.name ? 'Edit Information' : 'Set Information')
          .setEmoji(emojis.buttons.edit)
          .setStyle(buildingItem?.name ? 'SECONDARY' : 'PRIMARY'),
      ),
      row(
        new CancelItemCreateButton(categoryId).setLabel(t(this, 'CANCEL')).setStyle('DANGER'),
        new MessageButton()
          .setCustomId('whocares')
          .setDisabled()
          .setEmoji(emojis.buttons.left_arrow)
          .setStyle(buildingItem?.name ? 'PRIMARY' : 'SECONDARY'),
        new CreateItemPart2()
          .setEmoji(emojis.buttons.right_arrow)
          .setStyle(buildingItem?.name ? 'PRIMARY' : 'SECONDARY')
          .setDisabled(!buildingItem?.name || !buildingItem?.emoji || !buildingItem?.description),
      ),
    ),
  });
}
