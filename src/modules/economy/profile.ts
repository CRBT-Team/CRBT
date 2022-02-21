import { db, items } from '$lib/db';
import { avatar } from '$lib/functions/avatar';
import { CRBTscriptParser } from '$lib/functions/CRBTscriptParser';
import { getColor } from '$lib/functions/getColor';
import { APIProfile } from '$lib/types/CRBT/APIProfile';
import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { ChatCommand, components, OptionBuilder, row, UserContextCommand } from 'purplet';
import { EditColorBtn } from '../settings/color set & list';
import { EditProfileBtn, EditPronounsBtn } from './editProfile';

const Pronouns = {
  unspecified: 'Unspecified',
  hh: 'He/Him',
  hi: 'He/it',
  hs: 'He/She',
  ht: 'He/They',
  ih: 'It/Him',
  ii: 'It/Its',
  is: 'It/She',
  it: 'It/They',
  shh: 'She/He',
  sh: 'She/Her',
  si: 'She/It',
  st: 'She/They',
  th: 'They/He',
  ti: 'They/It',
  ts: 'They/She',
  tt: 'They/Them',
  any: 'Any',
  other: 'Other',
  ask: 'Ask me',
  avoid: 'username',
};

export default ChatCommand({
  name: 'profile',
  description: "Gets a user's profile.",
  options: new OptionBuilder().user('user', 'The user to get the profile of.', false),
  async handle({ user }) {
    const u = user ?? this.user;

    const profile = (await db.profiles.findFirst({
      where: { id: u.id },
    })) as APIProfile;

    const pronouns = (
      (await fetch(`https://pronoundb.org/api/v1/lookup?platform=discord&id=${u.id}`).then((res) =>
        res.json()
      )) as { pronouns: string }
    ).pronouns;

    const e = new MessageEmbed()
      .setAuthor({
        name: `${u.tag} - Profile`,
        iconURL: avatar(u, 64),
      })
      .setTitle(profile?.name ?? u.username)
      .setDescription(
        profile && profile.bio
          ? await CRBTscriptParser(profile.bio, u, profile, this.guild)
          : "*This user doesn't have a bio yet...*"
      )
      .setImage(
        profile && profile.crbt_banner
          ? `https://crbt.ga/banners/${items.banners[profile.crbt_banner].season}/${
              profile.crbt_banner
            }.png`
          : ''
      )
      .setColor(await getColor(u));

    if (profile && profile.crbt_badges && profile.crbt_badges.length > 0) {
      e.addField(
        `Badges (${profile.crbt_badges.length})`,
        profile.crbt_badges.map((badge) => items.badges[badge].contents).join(' '),
        true
      );
    }
    e.addField('Pronouns', Pronouns[pronouns].replace('username', u.username), true);

    this.reply({
      embeds: [e],
      components:
        u.id === this.user.id
          ? components(
              row(
                new EditProfileBtn(u.id)
                  .setStyle('PRIMARY')
                  .setEmoji('✏️')
                  .setLabel('Edit Profile'),
                new EditColorBtn()
                  .setStyle('SECONDARY')
                  .setEmoji('🎨')
                  .setLabel('Edit Accent Color'),
                new EditPronounsBtn().setStyle('SECONDARY').setEmoji('🗣').setLabel('Edit Pronouns')
              )
            )
          : null,
      // components: components(
      //   u.id === this.user.id
      // ? row(
      //     new EditProfileBtn(u.id).setStyle('PRIMARY').setEmoji('✏️').setLabel('Edit Profile'),
      //     new MessageButton()
      //       .setStyle('LINK')
      //       .setLabel(`Open in CRBT.app`)
      //       .setURL(`https://betacrbt.netlify.app/users/${u.id}`)
      //   )
      // : row(
      //     new MessageButton()
      //       .setStyle('LINK')
      //       .setLabel(`Open in CRBT.app`)
      //       .setURL(`https://betacrbt.netlify.app/users/${u.id}`)
      //   )
      // ),
    });
  },
});

export const ctxProfile = UserContextCommand({
  name: 'View CRBT Profile',
  async handle(u) {
    const profile = (await db.profiles.findFirst({
      where: { id: u.id },
    })) as APIProfile;

    const pronouns = (
      (await fetch(`https://pronoundb.org/api/v1/lookup?platform=discord&id=${u.id}`).then((res) =>
        res.json()
      )) as { pronouns: string }
    ).pronouns;

    const e = new MessageEmbed()
      .setAuthor({
        name: `${u.tag} - Profile`,
        iconURL: avatar(u, 64),
      })
      .setTitle(profile?.name ?? u.username)
      .setDescription(
        profile && profile.bio
          ? await CRBTscriptParser(profile.bio, u, profile, this.guild)
          : "*This user doesn't have a bio yet...*"
      )
      .setImage(
        profile && profile.crbt_banner
          ? `https://crbt.ga/banners/${items.banners[profile.crbt_banner].season}/${
              profile.crbt_banner
            }.png`
          : ''
      )
      .setColor(await getColor(u));

    if (profile && profile.crbt_badges && profile.crbt_badges.length > 0) {
      e.addField(
        `Badges (${profile.crbt_badges.length})`,
        profile.crbt_badges.map((badge) => items.badges[badge].contents).join(' '),
        true
      );
    }
    e.addField('Pronouns', Pronouns[pronouns].replace('username', u.username), true);

    this.reply({
      embeds: [e],
      components:
        u.id === this.user.id
          ? components(
              row(
                new EditProfileBtn(u.id)
                  .setStyle('PRIMARY')
                  .setEmoji('✏️')
                  .setLabel('Edit Profile'),
                new EditColorBtn()
                  .setStyle('SECONDARY')
                  .setEmoji('🎨')
                  .setLabel('Edit Accent Color'),
                new EditPronounsBtn().setStyle('SECONDARY').setEmoji('🗣').setLabel('Edit Pronouns')
              )
            )
          : null,
      // components: components(
      //   u.id === this.user.id
      // ? row(
      //     new EditProfileBtn(u.id).setStyle('PRIMARY').setEmoji('✏️').setLabel('Edit Profile'),
      //     new MessageButton()
      //       .setStyle('LINK')
      //       .setLabel(`Open in CRBT.app`)
      //       .setURL(`https://betacrbt.netlify.app/users/${u.id}`)
      //   )
      // : row(
      //     new MessageButton()
      //       .setStyle('LINK')
      //       .setLabel(`Open in CRBT.app`)
      //       .setURL(`https://betacrbt.netlify.app/users/${u.id}`)
      //   )
      // ),
      ephemeral: u.id !== this.user.id,
    });
  },
});
