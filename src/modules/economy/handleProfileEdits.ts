import { cache } from '$lib/cache';
import { colors, db, illustrations } from '$lib/db';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { trimSpecialChars } from '$lib/functions/trimSpecialChars';
import { APIProfile } from '$lib/types/CRBT/APIProfile';
import dayjs from 'dayjs';
import { MessageEmbed, ModalSubmitInteraction } from 'discord.js';
import { OnEvent } from 'purplet';
import { renderProfile } from './profile';

const urlRegex =
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;

//@ts-ignore
export default OnEvent('modalSubmit', async (modal: ModalSubmitInteraction) => {
  const bday = dayjs(modal.fields.getTextInputValue('profile_birthday').trim() + 'T12:00:00');
  const url = modal.fields.getTextInputValue('profile_url').trim();

  const newProfile = {
    name: trimSpecialChars(modal.fields.getTextInputValue('profile_name')).trim(),
    bio: modal.fields.getTextInputValue('profile_bio').trim(),
    birthday: bday.isValid() ? bday.toDate() : undefined,
    location: modal.fields.getTextInputValue('profile_location').trim(),
    url: url.match(urlRegex) ? url : undefined,
  } as APIProfile;

  const msg = await modal.channel.messages.fetch(modal.customId);

  const oldProfile = (await db.profiles.findFirst({
    where: { id: modal.user.id },
    select: { name: true, bio: true, birthday: true, location: true, url: true },
  })) as APIProfile;

  if (
    newProfile.name !== oldProfile.name &&
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

    msg.edit(await renderProfile(profile, modal.user, modal.guild, modal));

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
      ephemeral: true,
    });
  } catch (error) {
    modal.reply(UnknownError(modal, String(error)));
  }
});
