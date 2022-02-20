import { CRBTError } from '$lib/functions/CRBTError';
import discordModals, { Modal, showModal, TextInputComponent } from 'discord-modals';
import { ButtonComponent } from 'purplet';

export const EditProfileBtn = ButtonComponent({
  handle(userId: string) {
    if (this.user.id !== userId) {
      return this.reply(CRBTError('You can only edit your own profile.'));
    }
    discordModals(this.client);

    const modal = new Modal()
      .setCustomId(this.message.id)
      .setTitle('Edit Profile')
      .addComponents(
        new TextInputComponent()
          .setCustomId('profile_name')
          .setLabel('Name')
          .setStyle('SHORT')
          .setPlaceholder('Your CRBT profile name, should be unique.')
          .setValue('/')
          .setMinLength(3)
          .setMaxLength(20)
          .setRequired(true),
        new TextInputComponent()
          .setCustomId('profile_bio')
          .setLabel('A bio')
          .setStyle('LONG')
          .setPlaceholder('Tell us about yourself. CRBTscript tags accepted.')
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
