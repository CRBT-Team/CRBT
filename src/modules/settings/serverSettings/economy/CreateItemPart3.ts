import { emojis } from '$lib/env';
import { t } from '$lib/language';
import { EditableFeatures } from '$lib/types/settings';
import { timestampMention } from '@purplet/utils';
import { MessageButton, MessageComponentInteraction } from 'discord.js';
import { ButtonComponent, components, row } from 'purplet';
import { getSettings, getSettingsHeader } from '../_helpers';
import { CancelItemCreateButton } from './CancelItemCreateButton';
import { newItemCache } from './CreateItemPart1';
import { CreateItemPart2 } from './CreateItemPart2';
import { EditItemStockButton } from './EditItemStockButton';

export const CreateItemPart3 = ButtonComponent({
  async handle() {
    await handleCreateItemPart3.call(this);
  },
});

//TODO: localize
export async function handleCreateItemPart3(this: MessageComponentInteraction) {
  await this.deferUpdate();

  const { economy, accentColor } = await getSettings(this.guildId);
  const buildingItem = newItemCache.get(this.message.id);

  await this.editReply({
    embeds: [
      {
        ...getSettingsHeader(this.locale, accentColor, [
          this.guild.name,
          t(this, EditableFeatures.economy),
          `Editing ${buildingItem!.name}`,
          'Limits',
        ]),
        description:
          'Optionally, you can set limits as to how much maximum stock this item can have for all users, or if this item should be limited in time.\nNote that when the item runs out of stock or expires, you will always be able to edit it, restock it, or push its time of expiry.',
        fields: [
          {
            name: 'Stock',
            value:
              !buildingItem.stock && buildingItem.stock !== 0
                ? 'Unlimited'
                : buildingItem.stock?.toLocaleString(this.locale),
            inline: true,
          },
          {
            name: 'Limited until',
            value: buildingItem.availableUntil
              ? timestampMention(buildingItem.availableUntil, 'f')
              : 'Always',
            inline: true,
          },
        ],
      },
    ],
    components: components(
      row(
        new EditItemStockButton({
          mode: 'setup',
        })
          .setLabel('Edit Stock')
          .setStyle('PRIMARY')
          .setEmoji(emojis.buttons.pencil)
      ),
      row(
        new CancelItemCreateButton(buildingItem.categoryId)
          .setLabel(t(this, 'CANCEL'))
          .setStyle('SECONDARY'),
        new CreateItemPart2().setEmoji(emojis.buttons.left_arrow).setStyle('SECONDARY'),
        buildingItem.stock || buildingItem.availableUntil
          ? new MessageButton()
              .setCustomId('whocares')
              .setLabel('Skip')
              .setEmoji(emojis.buttons.right_arrow)
              .setStyle('SECONDARY')
          : new MessageButton()
              .setCustomId('whocares')
              .setLabel(t(this, 'PREVIEW'))
              .setStyle('PRIMARY')
      )
    ),
  });
}
