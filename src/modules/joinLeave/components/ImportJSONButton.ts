import { CamelCaseGuildFeatures } from '$lib/types/guild-settings';
import { MessageBuilderTypes } from '$lib/types/messageBuilder';
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
            .setPlaceholder(
              `Paste the contents of the ${CamelCaseGuildFeatures[type]}.json file here.`
            )
            .setRequired(true)
        )
      );

    this.showModal(modal);
  },
});
