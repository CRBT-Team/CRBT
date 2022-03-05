import { cache } from '$lib/cache';
import { colors, db, emojis } from '$lib/db';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { CRBTscriptParser } from '$lib/functions/CRBTscriptParser';
import { trimSpecialChars } from '$lib/functions/trimSpecialChars';
import { APIProfile } from '$lib/types/CRBT/APIProfile';
import { MessageEmbed, ModalSubmitInteraction } from 'discord.js';
import { OnEvent } from 'purplet';

//@ts-ignore
export default OnEvent('modalSubmit', async (modal: ModalSubmitInteraction) => {
  const name = trimSpecialChars(modal.fields.getTextInputValue('profile_name')).trim();
  const bio = modal.fields.getTextInputValue('profile_bio').trim();

  const msg = await modal.channel.messages.fetch(modal.customId);
  const { author, color, fields, image, thumbnail } = msg.embeds[0];

  const oldProfile = (await db.profiles.findFirst({
    where: { id: modal.user.id },
  })) as APIProfile;

  if (
    cache
      .get<string[]>('profiles')
      .map((p) => p.toLowerCase())
      .includes(name.toLowerCase())
  ) {
    modal.reply(CRBTError('This profile name is already taken.'));
  }

  try {
    const profile =
      name === oldProfile.name && bio === oldProfile.bio
        ? oldProfile
        : ((await db.profiles.upsert({
            update: {
              name,
              bio,
            },
            create: {
              id: modal.user.id,
              name: name,
              bio,
              purplets: 0,
            },
            where: { id: modal.user.id },
          })) as APIProfile);
    if (name !== oldProfile.name) {
      const map = name;
      const fromCache = cache.get<string[]>('profiles');
      cache.set<string[]>('profiles', [
        ...fromCache.filter((name) => name !== oldProfile.name),
        map,
      ]);
    }

    msg.edit({
      embeds: [
        new MessageEmbed({
          author,
          fields,
          image,
          color,
          thumbnail,
        })
          .setTitle(`@${name}${profile?.verified ? ` ${emojis.verified}` : ''}`)
          .setDescription(
            bio
              ? await CRBTscriptParser(bio, modal.user, profile, modal.guild)
              : "*This user doesn't have a bio yet...*"
          ),
      ],
    });

    modal.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: 'Profile updated!',
            iconURL: modal.user.avatarURL(),
          })
          .setDescription('Note: Some characters may have been removed as they are not allowed.')
          .setColor(`#${colors.success}`),
      ],
      ephemeral: true,
    });
  } catch (error) {
    modal.reply(UnknownError(modal, String(error)));
  }
});
