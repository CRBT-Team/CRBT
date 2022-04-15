import { db } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { showModal } from '$lib/functions/showModal';
import { getStrings } from '$lib/language';
import { MessageActionRow, Modal, TextInputComponent } from 'discord.js';
import { ButtonComponent } from 'purplet';

export const EditProfileBtn = ButtonComponent({
  async handle(userId: string) {
    const { strings, errors } = getStrings(this.locale).profile;

    if (this.user.id !== userId) {
      return this.reply(CRBTError(errors.CAN_ONLY_EDIT_OWN_PROFILE));
    }

    const profile = await db.profiles.findFirst({
      where: { id: userId },
      select: { name: true, bio: true, url: true, birthday: true, location: true },
    });

    const modal = new Modal()
      .setTitle(strings.BUTTON_EDIT_PROFILE)
      .setCustomId(this.message.id)
      .setComponents(
        //@ts-ignore
        new MessageActionRow().setComponents(
          new TextInputComponent()
            .setCustomId('profile_name')
            .setLabel(strings.NAME)
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
            .setLabel(strings.BIO)
            .setStyle('PARAGRAPH')
            .setPlaceholder(strings.MODAL_BIO_PLACEHOLDER)
            .setValue(profile?.bio ?? '')
            .setMinLength(10)
            .setMaxLength(150)
        ),
        new MessageActionRow().setComponents(
          new TextInputComponent()
            .setCustomId('profile_url')
            .setLabel(strings.WEBSITE)
            .setStyle('SHORT')
            .setPlaceholder(strings.MODAL_WEBSITE_PLACEHOLDER)
            .setValue(profile?.url ?? '')
            .setMinLength(3)
            .setMaxLength(50)
        ),
        new MessageActionRow().setComponents(
          new TextInputComponent()
            .setCustomId('profile_birthday')
            .setLabel(strings.BIRTHDAY)
            .setStyle('SHORT')
            .setPlaceholder(strings.MODAL_BIRTHDAY_PLACEHOLDER)
            .setValue(profile?.birthday?.toISOString()?.split('T')[0] ?? '')
            .setMinLength(10)
            .setMaxLength(10)
        ),
        new MessageActionRow().setComponents(
          new TextInputComponent()
            .setCustomId('profile_location')
            .setLabel(strings.LOCATION)
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
