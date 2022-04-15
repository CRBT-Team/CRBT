import { cache } from '$lib/cache';
import { CRBTUser } from '$lib/classes/CRBTUser';
import { colors, db, icons, links, misc } from '$lib/db';
import { avatar } from '$lib/functions/avatar';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { trimSpecialChars } from '$lib/functions/trimSpecialChars';
import dayjs from 'dayjs';
import { Message, MessageEmbed, ModalSubmitInteraction, TextChannel } from 'discord.js';
import { OnEvent } from 'purplet';
import { issueReply } from '../dev/fix';
import { renderProfile } from '../economy/profile';

const urlRegex =
  /(?:(?:https?:\/\/)?(?:[\w-]{2,255}(?:\.\w{2,6}){1,2}(?:\:\d{1,5})?(?:\/[^\s\n]*)?))/;

//@ts-ignore
export default OnEvent('modalSubmit', async (modal: ModalSubmitInteraction) => {
  if (modal.customId.startsWith('issue_')) {
    const reportChannel = modal.client.channels.cache.get(
      misc.channels[modal.client.user.id === misc.CRBTid ? 'report' : 'reportDev']
    ) as TextChannel;
    const url = modal.customId.replace('issue_', '');
    const title = modal.fields.getTextInputValue('issue_title');
    const desc = modal.fields.getTextInputValue('issue_description');

    await modal.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: 'Issue sent successfully.',
            iconURL: icons.success,
          })
          .setDescription(
            `Your issue has been sent to the **[CRBT Community](${links.discord})**.\nWe will review it, and you'll get notified on developer messages through your DMs.`
          )
          .setColor(`#${colors.success}`),
      ],
    });

    reportChannel.send({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: `${modal.user.tag} filed an issue`,
            iconURL: avatar(modal.user, 64),
            url: modal.channel.type !== 'DM' ? ((await modal.fetchReply()) as Message).url : null,
          })
          .setTitle(title)
          .setURL(modal.channel.type !== 'DM' ? ((await modal.fetchReply()) as Message).url : null)
          .setDescription(desc)
          .addField('Status', '<:pending:954734893072519198> Pending', true)
          .setImage(url.match(urlRegex) ? url : null)
          .setFooter({ text: `User ID: ${modal.user.id} • Last update` })
          .setTimestamp()
          .setColor(`#${colors.yellow}`),
      ],
    });
  } else if (modal.customId === 'suggestion') {
    const title = modal.fields.getTextInputValue('suggest_title');
    const desc = modal.fields.getTextInputValue('suggest_description');
    const channel = (await modal.client.channels.fetch(
      misc.channels[modal.client.user.id === misc.CRBTid ? 'report' : 'reportDev']
    )) as TextChannel;

    const msg = await channel.send({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: `${modal.user.tag} suggested`,
            iconURL: avatar(modal.user, 64),
          })
          .setTitle(title)
          .setDescription(desc)
          .addField('Status', '<:pending:954734893072519198> Pending', true)
          .setFooter({ text: `User ID: ${modal.user.id} • Last update` })
          .setTimestamp()
          .setColor(`#${colors.yellow}`),
      ],
    });

    const thread = await channel.threads.create({
      name: `🕒 - ${title}`,
      autoArchiveDuration: 'MAX',
      reason: 'CRBT Suggestion',
      type: 'GUILD_PUBLIC_THREAD',
      invitable: true,
      startMessage: msg,
    });

    await modal.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: 'Suggestion sent successfully.',
            iconURL: icons.success,
          })
          .setDescription(
            `A discussion thread has been sent in the **[CRBT Community](${
              (
                await thread.parent.createInvite({
                  maxAge: 36000,
                  unique: true,
                  maxUses: 1,
                })
              ).url
            })**.\nYou can join the thread **[here](${
              msg.url
            })** to discuss with other CRBT users about it.`
          )
          .setColor(`#${colors.success}`),
      ],
      ephemeral: true,
    });
  } else if (modal.customId.startsWith('replytoissue_')) {
    const issueChannel = modal.client.channels.cache.get(misc.channels.reportDev) as TextChannel;
    const issueMsg = await issueChannel.messages.fetch(modal.customId.replace('replytoissue_', ''));

    const reply = modal.fields.getTextInputValue('replymessage');

    await issueReply('reply', issueMsg, modal.user, reply);

    await modal.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: 'Reply sent successfully.',
            iconURL: icons.success,
          })
          .setDescription(
            `Your reply has been added to the issue that you can view **[here](${issueMsg.url})** (join the **[CRBT Community](${links.discord})** first if you haven't).\nAs always, you should recieve updates from CRBT developers through your DMs.`
          )
          .setColor(`#${colors.success}`),
      ],
    });
  } else {
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
    };

    const oldProfile = await db.profiles.findFirst({
      where: { id: modal.user.id },
    });

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
      const profileData =
        newProfile === oldProfile
          ? oldProfile
          : await db.profiles.upsert({
              update: {
                ...newProfile,
              },
              create: {
                id: modal.user.id,
                ...newProfile,
              },
              where: { id: modal.user.id },
            });
      if (newProfile !== oldProfile) {
        cache.set<string[]>('profiles', [
          newProfile.name,
          ...cache.get<string[]>('profiles').filter((name) => name !== oldProfile.name),
        ]);
      }
      const profile = new CRBTUser(modal.user, profileData);

      // if (msg.type !== 'CONTEXT_MENU_COMMAND') {
      //   await msg.edit(await renderProfile(profile, modal));
      // }

      //@ts-ignore
      await modal.update(await renderProfile(profile, modal));

      modal.followUp({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: 'Profile updated!',
              iconURL: icons.success,
            })
            .setDescription(
              (newProfile.name !== modal.fields.getTextInputValue('profile_name')
                ? '⚠️ Some characters in your name may have been removed if they are not allowed.'
                : '') +
                (!bday.isValid()
                  ? `\n⚠️ The date you set as your birthday is invalid, so it has been removed.`
                  : '') +
                (url.match(urlRegex)
                  ? ''
                  : `\n⚠️ The URL you set is invalid, so it has been removed.`)
            )
            .setColor(`#${colors.success}`),
        ],
        ephemeral: true,
      });
    } catch (error) {
      if (!modal.replied) {
        modal.reply(UnknownError(modal, error));
      } else {
        modal.followUp(UnknownError(modal, error));
      }
    }
  }
});
