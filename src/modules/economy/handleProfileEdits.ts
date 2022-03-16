import { cache } from '$lib/cache';
import { colors, db, illustrations } from '$lib/db';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { row } from '$lib/functions/row';
import { trimSpecialChars } from '$lib/functions/trimSpecialChars';
import { APIProfile } from '$lib/types/CRBT/APIProfile';
import dayjs from 'dayjs';
import { MessageButton, MessageEmbed, ModalSubmitInteraction } from 'discord.js';
import { components, OnEvent } from 'purplet';
import { renderProfile } from './profile';

const urlRegex =
  /(?:(?:https?:\/\/)?(?:[\w-]{2,255}(?:\.\w{2,6}){1,2}(?:\:\d{1,5})?(?:\/[^\s\n]*)?))/;

//@ts-ignore
export default OnEvent('modalSubmit', async (modal: ModalSubmitInteraction) => {
  const bday = dayjs(modal.fields.getTextInputValue('profile_birthday').trim() + 'T12:00:00');
  let url = modal.fields.getTextInputValue('profile_url').trim();

  const newProfile = {
    name: trimSpecialChars(modal.fields.getTextInputValue('profile_name')).trim(),
    bio: modal.fields.getTextInputValue('profile_bio').trim(),
    birthday: bday.isValid() && bday.isBefore(new Date()) ? bday.toDate() : null,
    location: modal.fields.getTextInputValue('profile_location').trim(),
    url: url.match(urlRegex)
      ? url.startsWith('http://') || url.startsWith('https://')
        ? url
        : 'https://' + url
      : null,
  } as APIProfile;

  const msg = await modal.channel.messages.fetch(modal.customId).catch(() => null);

  const oldProfile = (await db.profiles.findFirst({
    where: { id: modal.user.id },
  })) as APIProfile;

  if (
    newProfile.name !== oldProfile?.name &&
    cache
      .get<string[]>('profiles')
      .map((p) => p.toLowerCase())
      .includes(newProfile.name.toLowerCase())
  ) {
    return modal.reply(CRBTError('This profile name is already taken.'));
  }

  try {
    const profile =
      newProfile === oldProfile
        ? oldProfile
        : ((await db.profiles.upsert({
            update: {
              ...newProfile,
            },
            create: {
              id: modal.user.id,
              ...newProfile,
            },
            where: { id: modal.user.id },
          })) as APIProfile);
    if (newProfile !== oldProfile) {
      cache.set<string[]>('profiles', [
        newProfile.name,
        ...cache.get<string[]>('profiles').filter((name) => name !== oldProfile.name),
      ]);
    }

    if (msg) {
      await msg.edit(await renderProfile(profile, modal.user, modal.guild, modal));
    }

    modal.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: 'Profile updated!',
            iconURL: illustrations.success,
          })
          .setDescription(
            'Note: Some characters in your name may have been removed if they are not allowed.'
          )
          .setColor(`#${colors.success}`),
      ],
      components: msg
        ? components(
            row(new MessageButton().setLabel('Jump to Profile').setURL(msg.url).setStyle('LINK'))
          )
        : null,
      ephemeral: true,
    });
  } catch (error) {
    modal.reply(UnknownError(modal, String(error)));
  }
});
