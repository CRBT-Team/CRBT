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
          .setLabel('Bio')
          .setStyle('LONG')
          .setPlaceholder('Tell us about yourself. CRBTscript tags accepted.')
          .setMinLength(10)
          .setMaxLength(150)
          .setRequired(false)
      );

    showModal(modal, {
      client: this.client,
      interaction: this,
    });
  },
});

export const EditPronounsBtn = ButtonComponent({
  handle() {
    const pronouns = this.message.embeds[0].fields.find((f) => f.name === 'Pronouns').value;
    this.reply({
      content:
        `**${this.client.user.username}** gets pronoun data from the open **[PronounDB](<https://pronoundb.org/>)** service.\n` +
        (pronouns === 'Unspecified'
          ? '**[Register an account](<https://pronoundb.org/register>)** with Discord to display your pronouns on your CRBT profile!'
          : `You can edit your pronouns from the **[My Account page](<https://pronoundb.org/me>)**.`),
      ephemeral: true,
    });
  },
});
