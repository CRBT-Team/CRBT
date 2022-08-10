import { t } from '$lib/language';
import { TextInputComponent } from 'discord.js';
import { ButtonComponent, row } from 'purplet';
import { FieldEditModal } from './FieldEditModal';
import { editableList, MessageBuilderTypes } from './types';

export const ManualColorEditButton = ButtonComponent({
  handle(type: MessageBuilderTypes) {
    const [id, maxLength] = editableList.find(([id]) => id === 'color')!;

    this.showModal(
      new FieldEditModal({ fieldName: id, type })
        .setTitle(`Edit ${t(this, `FIELDS_${id.toUpperCase()}` as any)}`)
        .setComponents(
          row(
            new TextInputComponent()
              .setLabel('Value')
              .setCustomId('VALUE')
              .setStyle(maxLength > 256 ? 'SHORT' : 'PARAGRAPH')
              .setMaxLength(maxLength)
          )
        )
    );
  },
});
