import { emojis } from '$lib/env';
import { getEmojiURL } from '$lib/functions/getEmojiURL';
import { t } from '$lib/language';
import { EditableGuildFeatures } from '$lib/types/guild-settings';
import { ItemTypes } from '@prisma/client';
import { MessageComponentInteraction, MessageSelectMenu } from 'discord.js';
import { ButtonComponent, components, row } from 'purplet';
import { formatItemValue } from '../../../src/modules/economy/_helpers';
import {
  getGuildSettings,
  getGuildSettingsHeader,
} from '../../../src/modules/settings/server-settings/_helpers';
import { CancelItemCreateButton } from './CancelItemCreateButton';
import { CreateItemPart1, newItemCache } from './CreateItemPart1';
import { CreateItemPart3 } from './CreateItemPart3';
import { EditItemTypeSelectMenu } from './EditItemTypeSelectMenu';
import { roleSelectMenuCustomId } from './EditItemValueRoleSelect';

export const CreateItemPart2 = ButtonComponent({
  async handle() {
    await handleCreateItemPart2.call(this);
  },
});

//TODO: localize
export async function handleCreateItemPart2(this: MessageComponentInteraction) {
  await this.deferUpdate();

  const { economy, accentColor } = await getGuildSettings(this.guildId);
  const buildingItem = newItemCache.get(this.message.id);
  const lastRow = [
    new CancelItemCreateButton(buildingItem.categoryId)
      .setLabel(t(this, 'CANCEL'))
      .setStyle('SECONDARY'),
    new CreateItemPart1(buildingItem.categoryId)
      .setEmoji(emojis.buttons.left_arrow)
      .setStyle('SECONDARY'),
    new CreateItemPart3()
      .setLabel(t(this, 'NEXT'))
      .setEmoji(emojis.buttons.right_arrow)
      .setStyle('PRIMARY')
      .setDisabled(!buildingItem.type || !buildingItem.value),
  ];

  await this.editReply({
    embeds: [
      {
        ...getGuildSettingsHeader(this.locale, accentColor, [
          this.guild.name,
          t(this, EditableGuildFeatures.economy),
          `Editing ${buildingItem!.name}`,
          'Value',
        ]),
        description:
          'Choose an item type and its value.\nNote that once this item is created, you will not be able change its type.',
        fields: [
          {
            name: 'Type',
            value: buildingItem.type || `⚠️ Not set`,
            inline: true,
          },
          {
            name: 'Value',
            value: buildingItem.value
              ? formatItemValue(buildingItem.type, buildingItem.value)
              : `⚠️ Not set`,
            inline: true,
          },
        ],
        thumbnail: { url: getEmojiURL(buildingItem.icon) },
      },
    ],
    components: components(
      row(
        new EditItemTypeSelectMenu().setOptions({
          label: 'Role',
          description: 'Buying this item grants the selected role.',
          value: ItemTypes.ROLE,
          emoji: emojis.role,
          default: buildingItem.type === ItemTypes.ROLE,
        })
      ),
      row().addComponents(
        ...(buildingItem.type === ItemTypes.ROLE
          ? [
              new MessageSelectMenu()
                .setType('ROLE_SELECT')
                .setCustomId(`${roleSelectMenuCustomId}setup`),
            ]
          : lastRow)
      ),
      ...(!buildingItem.type ? [] : [row().addComponents(lastRow)])
    ),
  });
}
