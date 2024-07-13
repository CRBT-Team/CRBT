import { emojis, icons } from '$lib/env';
import { getEmojiURL } from '$lib/functions/getEmojiURL';
import { t } from '$lib/language';
import { timestampMention } from '@purplet/utils';
import dedent from 'dedent';
import { ButtonComponent, components, row } from 'purplet';
import { currencyFormat, formatItemType, formatItemValue } from '../../../economy/_helpers';
import { getGuildSettings } from '../_helpers';
import { CancelItemCreateButton } from './CancelItemCreateButton';
import { CreateItemPart1, newItemCache } from './CreateItemPart1';
import { CreateItemPart2 } from './CreateItemPart2';
import { CreateItemPart3 } from './CreateItemPart3';
import { CreateItemSaveButton } from './CreateItemSaveButton';

export const CreateItemReview = ButtonComponent({
  async handle() {
    const { economy, accentColor } = await getGuildSettings(this.guildId);
    const buildingItem = newItemCache.get(this.message.id);

    await this.update({
      embeds: [
        {
          author: {
            name: `${this.guild.name} - ${t(this, 'SETTINGS_TITLE')}`,
            iconURL: icons.settings,
          },
          color: accentColor,
          title: `Create Item > ${buildingItem?.name || 'New Item'} > Review`,
          description: dedent`
          The final step! Make sure you double check these properties before saving.
          `,
          fields: [
            {
              name: 'Name',
              value: `${buildingItem.emoji} ${buildingItem.name}`,
            },
            {
              name: t(this, 'DESCRIPTION'),
              value: buildingItem.description,
            },
            {
              name: 'Price',
              value:
                buildingItem.price === 0
                  ? 'Free'
                  : currencyFormat(buildingItem.price, economy, this.locale),
              inline: true,
            },
            {
              name: 'Type',
              value: formatItemType(buildingItem.type, this.locale),
              inline: true,
            },
            {
              name: 'Value',
              value: formatItemValue(buildingItem.type, buildingItem.value),
              inline: true,
            },
            {
              name: 'Stock',
              value:
                buildingItem.stock !== 0
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
          new CreateItemPart1(buildingItem.categoryId)
            .setLabel('Information')
            .setEmoji(emojis.buttons.edit)
            .setStyle('PRIMARY'),
          new CreateItemPart2().setLabel('Value').setEmoji(emojis.buttons.edit).setStyle('PRIMARY'),
          new CreateItemPart3()
            .setLabel('Availability')
            .setEmoji(emojis.buttons.edit)
            .setStyle('PRIMARY'),
        ),
        row(
          new CancelItemCreateButton(buildingItem.categoryId)
            .setLabel(t(this, 'CANCEL'))
            .setStyle('SECONDARY'),
          new CreateItemSaveButton().setStyle('SUCCESS').setLabel(t(this, 'SAVE')),
        ),
      ),
    });
  },
});
