import { emojis, icons } from '$lib/env';
import { getColor } from '$lib/functions/getColor';
import { getEmojiURL } from '$lib/functions/getEmojiURL';
import { t } from '$lib/language';
import { timestampMention } from '@purplet/utils';
import { MessageComponentInteraction, ModalSubmitInteraction } from 'discord.js';
import { ButtonComponent, components, row } from 'purplet';
import { CancelItemCreateButton } from './CancelItemCreateButton';
import { newItemCache } from './CreateItem1Info';
import { CreateItemPart2 } from './CreateItem2Value';
import { CreateItemReview } from './CreateItem4Review';
import { EditItemAvailabilityButton } from './EditItemAvailabilityButton';
import { getGuildSettings, getGuildSettingsHeader } from '../_helpers';
import { EditableGuildFeatures } from '$lib/types/guild-settings';

export const CreateItemPart3 = ButtonComponent({
  async handle() {
    await handleCreateItemPart3.call(this);
  },
});

//TODO: localize
export async function handleCreateItemPart3(
  this: MessageComponentInteraction | ModalSubmitInteraction,
) {
  await this.deferUpdate();

  const buildingItem = newItemCache.get(this.message.id);

  const settings = await getGuildSettings(this.guildId);

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
        title: `${buildingItem.name} - Availability (Optional)`,
        description:
          'You can restrict this item by setting a maximum stock for all users, or by setting a time limit.\n\n> **Note**\n> When the item runs out or expires, you can always edit it, restock it, or push its time of expiry.',
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
              : 'Always in stock',
            inline: true,
          },
        ],
        thumbnail: { url: getEmojiURL(buildingItem.emoji) },
      },
    ],
    components: components(
      row(
        new EditItemAvailabilityButton({
          mode: 'setup',
        })
          .setLabel(
            !buildingItem.stock && !buildingItem.availableUntil
              ? 'Set Availability'
              : 'Edit Availability',
          )
          .setStyle(!buildingItem.stock && !buildingItem.availableUntil ? 'PRIMARY' : 'SECONDARY')
          .setEmoji(emojis.buttons.edit),
      ),
      row(
        new CancelItemCreateButton(buildingItem.categoryId)
          .setLabel(t(this, 'CANCEL'))
          .setStyle('DANGER'),

        new CreateItemPart2().setEmoji(emojis.buttons.left_arrow).setStyle('PRIMARY'),

        !buildingItem.stock && !buildingItem.availableUntil
          ? new CreateItemReview()
              .setLabel('Skip')
              .setEmoji(emojis.buttons.right_arrow)
              .setStyle('PRIMARY')
          : new CreateItemReview()
              .setEmoji(emojis.buttons.right_arrow)
              .setLabel(t(this, 'PREVIEW'))
              .setStyle('PRIMARY'),
      ),
    ),
  });
}
