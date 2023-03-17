import { emojis } from '$lib/env';
import { getEmojiURL } from '$lib/functions/getEmojiURL';
import { t } from '$lib/language';
import { EditableFeatures } from '$lib/types/settings';
import { timestampMention } from '@purplet/utils';
import { ButtonComponent, components, row } from 'purplet';
import { currencyFormat, formatItemValue } from '../../../src/modules/economy/_helpers';
import {
  getSettings,
  getSettingsHeader,
} from '../../../src/modules/settings/serverSettings/_helpers';
import { CancelItemCreateButton } from './CancelItemCreateButton';
import { CreateItemPart1, newItemCache } from './CreateItemPart1';
import { CreateItemPart2 } from './CreateItemPart2';
import { CreateItemPart3 } from './CreateItemPart3';
import { CreateItemSaveButton } from './CreateItemSaveButton';

export const CreateItemReview = ButtonComponent({
  async handle() {
    const { economy, accentColor } = await getSettings(this.guildId);
    const buildingItem = newItemCache.get(this.message.id);

    await this.update({
      embeds: [
        {
          ...getSettingsHeader(this.locale, accentColor, [
            this.guild.name,
            t(this, EditableFeatures.economy),
            `Editing ${buildingItem!.name}`,
            'Review',
          ]),
          description: `The final step! Make sure to double check these properties before saving changes, and hit ${t(
            this,
            'SAVE'
          )} when you are ready.`,
          fields: [
            {
              name: 'Name',
              value: `${buildingItem.icon} ${buildingItem.name}`,
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
              value: buildingItem.type,
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
          thumbnail: { url: getEmojiURL(buildingItem.icon) },
        },
      ],
      components: components(
        row(
          new CreateItemPart1(buildingItem.categoryId)
            .setLabel('Information')
            .setEmoji(emojis.buttons.pencil)
            .setStyle('PRIMARY'),
          new CreateItemPart2()
            .setLabel('Value')
            .setEmoji(emojis.buttons.pencil)
            .setStyle('PRIMARY'),
          new CreateItemPart3()
            .setLabel('Availability')
            .setEmoji(emojis.buttons.pencil)
            .setStyle('PRIMARY')
        ),
        row(
          new CancelItemCreateButton(buildingItem.categoryId)
            .setLabel(t(this, 'CANCEL'))
            .setStyle('SECONDARY'),
          new CreateItemSaveButton().setStyle('SUCCESS').setLabel(t(this, 'SAVE'))
        )
      ),
    });
  },
});
