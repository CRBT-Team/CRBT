import { showModal } from '$lib/functions/showModal';
import { MessageActionRow, Modal, TextInputComponent } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'report',
  description: 'File a new issue on the Discord server.',
  options: new OptionBuilder().string(
    'image_url',
    'An image URL (PNG, JPG, WEBP or GIF) to attach to the report.'
  ),
  async handle({ image_url }) {
    const modal = new Modal()
      .setTitle('New issue')
      .setCustomId(`issue_${image_url}`)
      .setComponents(
        //@ts-ignore
        new MessageActionRow().setComponents(
          new TextInputComponent()
            .setCustomId('issue_title')
            .setLabel('Title')
            .setPlaceholder("What's the issue?")
            .setStyle('SHORT')
            .setMinLength(10)
            .setMaxLength(50)
            .setRequired(true)
        ),
        new MessageActionRow().setComponents(
          new TextInputComponent()
            .setCustomId('issue_description')
            .setLabel('Description')
            .setPlaceholder('Describe your issue in detail.')
            .setStyle('PARAGRAPH')
            .setMinLength(10)
            .setMaxLength(500)
        )
      );

    await showModal(modal, this);
  },
});
