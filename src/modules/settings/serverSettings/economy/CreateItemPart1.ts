import { emojis } from '$lib/env';
import { getEmojiURL } from '$lib/functions/getEmojiURL';
import { t } from '$lib/language';
import { EditableFeatures } from '$lib/types/settings';
import { EconomyItem } from '@prisma/client';
import { MessageButton, MessageComponentInteraction } from 'discord.js';
import { ButtonComponent, components, row } from 'purplet';
import { currencyFormat } from '../../../economy/_helpers';
import { getSettings, getSettingsHeader } from '../_helpers';
import { CreateItemPart2 } from './CreateItemPart2';
import { EditCategoriesButton } from './EditCategoriesButton';
import { EditItemInfoButton } from './EditItemInfoButton';

export const newItemCache = new Map<string, Partial<EconomyItem>>();

export const CreateItemButton = ButtonComponent({
  async handle(categoryId: number) {
    await handleCreateItemPart1.call(this, categoryId);
  },
});

export async function handleCreateItemPart1(this: MessageComponentInteraction, categoryId: number) {
  await this.deferUpdate();
  const { economy, accentColor } = await getSettings(this.guildId);
  const buildingItem = newItemCache.get(this.message.id);

  await this.editReply({
    embeds: [
      {
        ...getSettingsHeader(this.locale, accentColor, [
          this.guild.name,
          t(this, EditableFeatures.economy),
          `Editing ${buildingItem?.name || 'New Item'}`,
          'Information',
        ]),
        description: 'Choose a name, icon, description & price for your item.',
        fields: [
          {
            name: t(this, 'DESCRIPTION'),
            value: buildingItem?.description ?? `⚠️ Not set`,
          },
          {
            name: 'Price',
            value: buildingItem?.price
              ? currencyFormat(buildingItem.price, economy, this.locale)
              : '⚠️ Not set',
          },
        ],
        thumbnail: buildingItem?.icon ? { url: getEmojiURL(buildingItem.icon) } : null,
      },
    ],
    components: components(
      row(
        new EditItemInfoButton({
          mode: 'setup',
          cId: categoryId,
        })
          .setLabel(t(this, 'EDIT'))
          .setEmoji(emojis.buttons.pencil)
          .setStyle('PRIMARY')
      ),
      //TODO: add a button to get to the category
      row(
        new EditCategoriesButton().setLabel(t(this, 'CANCEL')).setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('whocares')
          .setDisabled()
          .setEmoji(emojis.buttons.left_arrow)
          .setStyle('SECONDARY'),
        new CreateItemPart2()
          .setLabel(t(this, 'NEXT'))
          .setEmoji(emojis.buttons.right_arrow)
          .setStyle('PRIMARY')
          .setDisabled(!buildingItem?.name || !buildingItem?.icon || !buildingItem?.description)
      )
    ),
  });
}
