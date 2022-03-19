import { showModal } from '$lib/functions/showModal';
import { MessageActionRow, Modal, TextInputComponent } from 'discord.js';
import { ChatCommand } from 'purplet';

export default ChatCommand({
  name: 'suggest',
  description: 'Send a suggestion for CRBT on the Discord server.',
  async handle() {
    const modal = new Modal()
      .setTitle('New suggestion')
      .setCustomId(`suggestion`)
      .setComponents(
        //@ts-ignore
        new MessageActionRow().setComponents(
          new TextInputComponent()
            .setCustomId('suggest_title')
            .setLabel('Title')
            .setPlaceholder('What do you want to suggest?')
            .setStyle('SHORT')
            .setMinLength(10)
            .setMaxLength(50)
            .setRequired(true)
        ),
        new MessageActionRow().setComponents(
          new TextInputComponent()
            .setCustomId('suggest_description')
            .setLabel('Description')
            .setPlaceholder(
              'Describe your suggestion. What would it do? How would it improve CRBT?'
            )
            .setStyle('PARAGRAPH')
            .setMinLength(10)
            .setMaxLength(500)
        )
      );

    await showModal(modal, this);
  },
});
