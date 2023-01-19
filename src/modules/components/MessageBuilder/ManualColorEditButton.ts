import { t } from '$lib/language';
import { editableList, MessageBuilderTypes } from '$lib/types/messageBuilder';
import { EditableFeatures } from '$lib/types/settings';
import chroma from 'chroma-js';
import { TextInputComponent } from 'discord.js';
import { ButtonComponent, row } from 'purplet';
import { FieldEditModal } from './FieldEditModal';

export const ManualColorEditButton = ButtonComponent({
  handle({
    type,
    value,
  }: {
    type: MessageBuilderTypes | EditableFeatures.accentColor;
    value: number;
  }) {
    const [id, maxLength] = editableList.find(([id]) => id === 'color')!;
    const color = chroma(value).hex();

    this.showModal(
      new FieldEditModal({ fieldName: id, type })
        .setTitle(
          t(this, 'EDIT_SOMETHING', {
            feature: t(this, `FIELDS_${id.toUpperCase()}` as any),
          })
        )
        .setComponents(
          row(
            new TextInputComponent()
              .setLabel('Value')
              .setCustomId('VALUE')
              .setStyle('SHORT')
              .setValue(color)
              .setMaxLength(maxLength)
          )
        )
    );
  },
});
