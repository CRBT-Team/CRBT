import { MessageBuilderTypes } from '$lib/types/MessageBuilder';
import { CamelCaseFeatures } from '$lib/types/settings';
import { TextInputComponent } from 'discord.js';
import { ButtonComponent, row } from 'purplet';
import { ImportJSONModal } from './ImportJSONModal';

export const ImportJSONButton = ButtonComponent({
  async handle(type: MessageBuilderTypes) {
    const modal = new ImportJSONModal(type as never)
      .setTitle('Import from JSON')
      .setComponents(
        row(
          new TextInputComponent()
            .setLabel('Value')
            .setCustomId('value')
            .setStyle('PARAGRAPH')
            .setMinLength(29)
            .setMaxLength(4000)
            .setPlaceholder(`Paste the contents of the ${CamelCaseFeatures[type]}.json file here.`)
            .setRequired(true)
        )
      );

    this.showModal(modal);
  },
});
