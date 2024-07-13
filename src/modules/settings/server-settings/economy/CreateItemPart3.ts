import { emojis, icons } from '$lib/env';
import { getColor } from '$lib/functions/getColor';
import { getEmojiURL } from '$lib/functions/getEmojiURL';
import { t } from '$lib/language';
import { timestampMention } from '@purplet/utils';
import { MessageComponentInteraction, ModalSubmitInteraction } from 'discord.js';
import { ButtonComponent, components, row } from 'purplet';
import { CancelItemCreateButton } from './CancelItemCreateButton';
import { newItemCache } from './CreateItemPart1';
import { CreateItemPart2 } from './CreateItemPart2';
import { CreateItemReview } from './CreateItemReview';
import { EditItemAvailabilityButton } from './EditItemAvailabilityButton';

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

  await this.editReply({
    embeds: [
      {
        author: {
          name: `${this.guild.name} - ${t(this, 'SETTINGS_TITLE')}`,
          iconURL: icons.settings,
        },
        color: await getColor(this.guild),
        title: `Create Item > ${buildingItem?.name || 'New Item'} > Availability`,
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
              : 'Always in stock',
            inline: true,
          },
        ],
        thumbnail: buildingItem.emoji ? { url: getEmojiURL(buildingItem.emoji) } : null,
      },
    ],
    components: components(
      row(
        new EditItemAvailabilityButton({
          mode: 'setup',
        })
          .setLabel(t(this, 'EDIT'))
          .setStyle('PRIMARY')
          .setEmoji(emojis.buttons.edit),
      ),
      row(
        new CancelItemCreateButton(buildingItem.categoryId)
          .setLabel(t(this, 'CANCEL'))
          .setStyle('SECONDARY'),
        new CreateItemPart2().setEmoji(emojis.buttons.left_arrow).setStyle('SECONDARY'),
        buildingItem.stock || buildingItem.availableUntil
          ? new CreateItemReview()
              .setLabel('Skip')
              .setEmoji(emojis.buttons.right_arrow)
              .setStyle('SECONDARY')
          : new CreateItemReview().setLabel(t(this, 'PREVIEW')).setStyle('PRIMARY'),
      ),
    ),
  });
}
