import { colorsMap } from '$lib/autocomplete/colorAutocomplete';
import { cache } from '$lib/cache';
import { emojis } from '$lib/db';
import { t } from '$lib/language';
import { TextInputComponent } from 'discord.js';
import { components, row, SelectMenuComponent } from 'purplet';
import { AuthorEditModal } from './AuthorEditModal';
import { BackButton } from './BackButton';
import { ColorPresetSelectMenu } from './ColorPresetSelectMenu';
import { FieldEditModal } from './FieldEditModal';
import { getFieldValue } from './getFieldValue';
import { ManualColorEditButton } from './ManualColorEditButton';
import { editableList, editableNames, MessageBuilderData, MessageBuilderTypes } from './types';

export const FieldSelectMenu = SelectMenuComponent({
  handle(type: MessageBuilderTypes) {
    const fieldName = this.values[0] as editableNames;
    const { BACK } = t(this, 'genericButtons');

    const messageData = cache.get<MessageBuilderData>(`${type}_BUILDER:${this.guildId}`);

    if (fieldName === 'color') {
      return this.update({
        components: components(
          row(
            new ColorPresetSelectMenu()
              .setPlaceholder(t(this, 'COLOR_PRESET_SELECT_MENU'))
              .setOptions(
                colorsMap
                  .filter((color) => !color.private && color.value !== 'profile')
                  .map((colorObj) => ({
                    label: colorObj.fullName,
                    value: colorObj.value,
                    emoji: colorObj.emoji,
                  }))
              )
          ),
          row(
            new BackButton(type as never)
              .setLabel(BACK)
              .setEmoji(emojis.buttons.left_arrow)
              .setStyle('SECONDARY'),
            new ManualColorEditButton(type as never)
              .setLabel(t(this, 'MANUAL_COLOR_EDIT_BUTTON'))
              .setEmoji(emojis.buttons.pencil)
              .setStyle('PRIMARY')
          )
        ),
      });
    }
    if (fieldName.startsWith('author')) {
      const authorFields: editableNames[] = ['author_name', 'author_icon', 'author_url'];

      const modal = new AuthorEditModal(type as never)
        .setTitle(`Edit ${t(this, 'FIELDS_AUTHOR')}`)
        .setComponents(
          ...authorFields.map((fieldName) => {
            const value = getFieldValue(messageData, fieldName);
            const [id, maxLength, markdownSupport] = editableList.find(([id]) => id === fieldName)!;

            return row(
              new TextInputComponent()
                .setLabel(t(this, `FIELDS_${id.toUpperCase()}` as any))
                .setValue(value ?? '')
                .setCustomId(fieldName.toUpperCase())
                .setStyle(maxLength <= 256 ? 'SHORT' : 'PARAGRAPH')
                .setMaxLength(maxLength)
                .setPlaceholder(markdownSupport ? t(this, 'MARKDOWN_CRBTSCRIPT_SUPPORT') : '')
            );
          })
        );

      return this.showModal(modal);
    }

    const [id, maxLength, markdownSupport] = editableList.find(([id]) => id === fieldName)!;
    const value = getFieldValue(messageData, fieldName);
    const name = t(this, `FIELDS_${fieldName.toUpperCase()}` as any);
    const modal = new FieldEditModal({ fieldName, type }).setTitle(`Edit ${name}`).setComponents(
      row(
        new TextInputComponent()
          .setLabel('Value')
          .setValue(value ?? '')
          .setCustomId('VALUE')
          .setStyle(maxLength <= 256 ? 'SHORT' : 'PARAGRAPH')
          .setMaxLength(maxLength)
          .setPlaceholder(markdownSupport ? t(this, 'MARKDOWN_CRBTSCRIPT_SUPPORT') : '')
      )
    );

    return this.showModal(modal);
  },
});
