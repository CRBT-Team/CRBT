import { ModalSubmitInteraction } from 'discord.js';
import { OnEvent } from 'purplet';

//@ts-ignore
export default OnEvent('modalSubmit', async (modal: ModalSubmitInteraction) => {
  // else {
  //   const bday = dayjs(modal.fields.getTextInputValue('profile_birthday').trim() + 'T12:00:00');
  //   let url = modal.fields.getTextInputValue('profile_url').trim();
  //   const newProfile = {
  //     name: trimSpecialChars(modal.fields.getTextInputValue('profile_name')).trim(),
  //     bio: modal.fields.getTextInputValue('profile_bio').trim(),
  //     birthday: bday.isValid() && bday.isBefore(new Date()) ? bday.toDate() : null,
  //     url: url.match(urlRegex)
  //       ? url.startsWith('http://') || url.startsWith('https://')
  //         ? url
  //         : 'https://' + url
  //       : null,
  //   };
  //   const oldProfile = await db.profiles.findFirst({
  //     where: { id: modal.user.id },
  //   });
  //   if (
  //     newProfile.name !== oldProfile?.name &&
  //     cache
  //       .get<string[]>('profiles')
  //       .map((p) => p.toLowerCase())
  //       .includes(newProfile.name.toLowerCase())
  //   ) {
  //     return modal.reply(CRBTError('This profile name is already taken.'));
  //   }
  //   try {
  //     const profileData =
  //       newProfile === oldProfile
  //         ? oldProfile
  //         : await db.profiles.upsert({
  //             update: {
  //               ...newProfile,
  //             },
  //             create: {
  //               id: modal.user.id,
  //               ...newProfile,
  //             },
  //             where: { id: modal.user.id },
  //           });
  //     if (newProfile !== oldProfile) {
  //       cache.set<string[]>('profiles', [
  //         newProfile.name,
  //         ...cache.get<string[]>('profiles').filter((name) => name !== oldProfile.name),
  //       ]);
  //     }
  //     const profile = new CRBTUser(modal.user, profileData);
  //     // if (msg.type !== 'CONTEXT_MENU_COMMAND') {
  //     //   await msg.edit(await renderProfile(profile, modal));
  //     // }
  //     //@ts-ignore
  //     await modal.update(await renderProfile(profile, modal));
  //     modal.followUp({
  //       embeds: [
  //         new MessageEmbed()
  //           .setAuthor({
  //             name: 'Profile updated!',
  //             iconURL: icons.success,
  //           })
  //           .setDescription(
  //             (newProfile.name !== modal.fields.getTextInputValue('profile_name')
  //               ? '⚠️ Some characters in your name may have been removed if they are not allowed.'
  //               : '') +
  //               (!bday.isValid()
  //                 ? `\n⚠️ The date you set as your birthday is invalid, so it has been removed.`
  //                 : '') +
  //               (url.match(urlRegex)
  //                 ? ''
  //                 : `\n⚠️ The URL you set is invalid, so it has been removed.`)
  //           )
  //           .setColor(`#${colors.success}`),
  //       ],
  //       ephemeral: true,
  //     });
  //   } catch (error) {
  //     if (!modal.replied) {
  //       modal.reply(UnknownError(modal, error));
  //     } else {
  //       modal.followUp(UnknownError(modal, error));
  //     }
  //   }
  // }
});
