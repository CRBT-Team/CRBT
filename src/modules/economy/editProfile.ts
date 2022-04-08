import { db } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { showModal } from '$lib/functions/showModal';
import { languages } from '$lib/language';
import { MessageActionRow, Modal, TextInputComponent } from 'discord.js';
import { ButtonComponent } from 'purplet';

export const EditProfileBtn = ButtonComponent({
  async handle(userId: string) {
    if (this.user.id !== userId) {
      return this.reply(CRBTError('You can only edit your own profile.'));
    }
    const { strings } = languages[this.locale].profile;

    const profile = await db.profiles.findFirst({
      where: { id: userId },
      select: { name: true, bio: true, url: true, birthday: true, location: true },
    });

    const modal = new Modal()
      .setTitle('Edit Profile')
      .setCustomId(this.message.id)
      .setComponents(
        //@ts-ignore
        new MessageActionRow().setComponents(
          new TextInputComponent()
            .setCustomId('profile_name')
            .setLabel('Name')
            .setStyle('SHORT')
            .setPlaceholder(strings.MODAL_NAME_PLACEHOLDER)
            .setValue(profile?.name ?? '')
            .setMinLength(3)
            .setMaxLength(20)
            .setRequired(true)
        ),
        new MessageActionRow().setComponents(
          new TextInputComponent()
            .setCustomId('profile_bio')
            .setLabel('Bio')
            .setStyle('PARAGRAPH')
            .setPlaceholder(strings.MODAL_BIO_PLACEHOLDER)
            .setValue(profile?.bio ?? '')
            .setMinLength(10)
            .setMaxLength(150)
        ),
        new MessageActionRow().setComponents(
          new TextInputComponent()
            .setCustomId('profile_url')
            .setLabel('Website')
            .setStyle('SHORT')
            .setPlaceholder(strings.MODAL_WEBSITE_PLACEHOLDER)
            .setValue(profile?.url ?? '')
            .setMinLength(3)
            .setMaxLength(50)
        ),
        new MessageActionRow().setComponents(
          new TextInputComponent()
            .setCustomId('profile_birthday')
            .setLabel('Birthday')
            .setStyle('SHORT')
            .setPlaceholder(strings.MODAL_BIRTHDAY_PLACEHOLDER)
            .setValue(profile?.birthday?.toISOString()?.split('T')[0] ?? '')
            .setMinLength(10)
            .setMaxLength(10)
        ),
        new MessageActionRow().setComponents(
          new TextInputComponent()
            .setCustomId('profile_location')
            .setLabel('Location')
            .setStyle('SHORT')
            .setPlaceholder(strings.MODAL_LOCATION_PLACEHOLDER)
            .setValue(profile?.location ?? '')
            .setMinLength(3)
            .setMaxLength(20)
        )
      );

    await showModal(modal, this);
  },
});
