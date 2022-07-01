import { t } from '$lib/language';
import { TextInputComponent } from 'discord.js';
import { ButtonComponent, row } from 'purplet';
import { editableList, MessageTypes } from '../types';
import { FieldEditModal } from './FieldEditModal';

export const ManualColorEditButton = ButtonComponent({
  handle(type: MessageTypes) {
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
