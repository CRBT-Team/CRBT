import { emojis, icons } from '$lib/env';
import { getEmojiURL } from '$lib/functions/getEmojiURL';
import { t } from '$lib/language';
import { timestampMention } from '@purplet/utils';
import dedent from 'dedent';
import { ButtonComponent, components, row } from 'purplet';
import {
  currencyFormat,
  formatItemType,
  formatItemValue,
  itemTypes,
} from '../../../economy/_helpers';
import { getGuildSettings, getGuildSettingsHeader } from '../_helpers';
import { CancelItemCreateButton } from './CancelItemCreateButton';
import { CreateItemPart1, newItemCache } from './CreateItem1Info';
import { CreateItemPart2 } from './CreateItem2Value';
import { CreateItemPart3 } from './CreateItem3Availability';
import { CreateItemSaveButton } from './CreateItem5SaveButton';
import { EditableGuildFeatures } from '$lib/types/guild-settings';

export const CreateItemReview = ButtonComponent({
  async handle() {
    const settings = await getGuildSettings(this.guildId);
    const buildingItem = newItemCache.get(this.message.id);
    const { economy } = settings;

    console.log(buildingItem);

    await this.update({
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
          title: `${buildingItem.name} - Review`,
          description: `The final step! Make sure you double check everything before saving.`,
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
              value: buildingItem.value
                ? formatItemValue(buildingItem.type, buildingItem.value)
                : `*${t(this, 'NONE')}*`,
              inline: true,
            },
            {
              name: 'Stock',
              value:
                buildingItem.stock === 0
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
            .setLabel('Edit Information')
            .setEmoji(emojis.buttons.edit)
            .setStyle('PRIMARY'),
          new CreateItemPart2()
            .setLabel('Edit Value')
            .setEmoji(emojis.buttons.edit)
            .setStyle('PRIMARY'),
          new CreateItemPart3()
            .setLabel('Edit Availability')
            .setEmoji(emojis.buttons.edit)
            .setStyle('PRIMARY'),
        ),
        row(
          new CancelItemCreateButton(buildingItem.categoryId)
            .setLabel(t(this, 'CANCEL'))
            .setStyle('DANGER'),
          new CreateItemSaveButton().setStyle('SUCCESS').setLabel('Save & Create Item'),
        ),
      ),
    });
  },
});
