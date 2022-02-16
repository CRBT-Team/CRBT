import discordModals, { Modal, showModal, TextInputComponent } from 'discord-modals';
import { ChatCommand } from 'purplet';

export default ChatCommand({
  name: 'create profile',
  description: 'Shows a profile creation modal.',
  async handle() {
    discordModals(this.client);

    const modal = new Modal()
      .setCustomId('customid')
      .setTitle('Create Profile')
      .addComponents(
        new TextInputComponent()
          .setCustomId('profile_username')
          .setLabel('Username')
          .setStyle('SHORT')
          .setPlaceholder(
            'This will be used in your CRBT.app vanity URL! You can change this later.'
          )
          .setValue('https://crbt.app/users/')
          .setMinLength(3)
          .setMaxLength(20)
          .setRequired(true),
        new TextInputComponent()
          .setCustomId('profile_bio')
          .setLabel('A bio')
          .setStyle('SHORT')
          .setPlaceholder('Tell us about yourself...')
          .setMinLength(10)
          .setMaxLength(100)
          .setRequired(false)
      );

    showModal(modal, {
      client: this.client,
      interaction: this,
    });
  },
});
