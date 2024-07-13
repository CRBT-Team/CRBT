import { emojis, icons } from '$lib/env';
import { getColor } from '$lib/functions/getColor';
import { getEmojiURL } from '$lib/functions/getEmojiURL';
import { t } from '$lib/language';
import dedent from 'dedent';
import { MessageComponentInteraction, MessageSelectMenu } from 'discord.js';
import { ButtonComponent, components, row } from 'purplet';
import { ItemType, formatItemType, formatItemValue, itemTypes } from '../../../economy/_helpers';
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

  const buildingItem = newItemCache.get(this.message.id);

  const lastRow = [
    new CancelItemCreateButton(buildingItem.categoryId)
      .setLabel(t(this, 'CANCEL'))
      .setStyle('SECONDARY'),
    new CreateItemPart1(buildingItem.categoryId)
      .setEmoji(emojis.buttons.left_arrow)
      .setStyle('SECONDARY'),
    new CreateItemPart3()
      // .setLabel(t(this, 'NEXT'))
      .setEmoji(emojis.buttons.right_arrow)
      .setStyle('PRIMARY')
      .setDisabled(
        buildingItem.type === undefined ||
          (itemTypes[buildingItem.type].hasValue && !buildingItem.value),
      ),
  ];

  await this.editReply({
    embeds: [
      {
        author: {
          name: `${this.guild.name} - ${t(this, 'SETTINGS_TITLE')}`,
          iconURL: icons.settings,
        },
        color: await getColor(this.guild),
        title: `Create Item > ${buildingItem?.name || 'New Item'} > Value`,
        description: dedent`
        Choose the type of item to create, and its value.
        Once the item is created, you will not be able change its type.
        `,
        fields: [
          {
            name: 'Type',
            value:
              buildingItem.type !== undefined
                ? formatItemType(buildingItem.type, this.locale)
                : `⚠️ Not set`,
            inline: true,
          },
          ...(buildingItem.type !== undefined && itemTypes[buildingItem.type].hasValue
            ? [
                {
                  name: 'Value',
                  value: buildingItem.value
                    ? formatItemValue(buildingItem.type, buildingItem.value)
                    : `⚠️ Not set`,
                  inline: true,
                },
              ]
            : []),
        ],
        thumbnail: buildingItem.emoji ? { url: getEmojiURL(buildingItem.emoji) } : null,
      },
    ],
    components: components(
      row(
        new EditItemTypeSelectMenu().setOptions([
          {
            label: 'Role',
            description: 'Buying this item grants the selected role.',
            value: ItemType.ROLE.toString(),
            emoji: emojis.role,
            default: buildingItem.type === ItemType.ROLE,
          },
          {
            label: 'Cosmetic',
            description: 'This item is purely cosmetic, and has no value.',
            value: ItemType.COSMETIC.toString(),
            emoji: '✨',
            default: buildingItem.type === ItemType.COSMETIC,
          },
        ]),
      ),
      row().addComponents(
        ...(buildingItem.type === ItemType.ROLE
          ? [
              new MessageSelectMenu()
                .setType('ROLE_SELECT')
                .setCustomId(`${roleSelectMenuCustomId}setup`),
            ]
          : lastRow),
      ),
      ...(buildingItem.type === ItemType.ROLE ? [row().addComponents(lastRow)] : []),
    ),
  });
}
