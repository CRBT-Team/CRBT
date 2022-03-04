import { db, emojis, items } from '$lib/db';
import { avatar } from '$lib/functions/avatar';
import { CRBTError } from '$lib/functions/CRBTError';
import { CRBTscriptParser } from '$lib/functions/CRBTscriptParser';
import { getColor } from '$lib/functions/getColor';
import { APIProfile } from '$lib/types/CRBT/APIProfile';
import { Guild, Interaction, MessageEmbed, User } from 'discord.js';
import fetch from 'node-fetch';
import { ChatCommand, components, OptionBuilder, row, UserContextCommand } from 'purplet';
import { EditColorBtn } from '../settings/color set & list';
import { EditProfileBtn, EditPronounsBtn } from './editProfile';

export const renderProfile = async (
  profile: APIProfile,
  user: User,
  guild: Guild,
  ctx: Interaction
) => {
  const pronouns = (
    (await fetch(`https://pronoundb.org/api/v1/lookup?platform=discord&id=${user.id}`).then((res) =>
      res.json()
    )) as { pronouns: string }
  ).pronouns;

  const e = new MessageEmbed()
    .setAuthor({
      name: `${user.tag} - Profile`,
      iconURL: avatar(user, 64),
    })
    .setTitle(
      profile?.name
        ? `@${profile.name}${profile?.verified ? ` ${emojis.verified}` : ''}`
        : user.username
    )
    .setDescription(
      profile && profile.bio
        ? await CRBTscriptParser(profile.bio, user, profile, guild)
        : user.equals(ctx.user)
        ? 'You don\'t have a bio! Set yourself one by clicking "Edit Profile" below.'
        : "*This user doesn't have a bio yet...*"
    )
    .setImage(
      profile && profile.crbt_banner
        ? `https://crbt.ga/banners/${items.banners[profile.crbt_banner].season}/${
            profile.crbt_banner
          }.png`
        : null
    )
    .setColor(await getColor(user));

  if (profile && profile.crbt_badges && profile.crbt_badges.length > 0) {
    e.addField(
      `Badges (${profile.crbt_badges.length})`,
      profile.crbt_badges.map((badge) => items.badges[badge].contents).join(' '),
      profile.crbt_badges.length > 6
    );
  }
  e.addField('Pronouns', Pronouns[pronouns].replace('username', user.username), true);

  return e;
};

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
  options: new OptionBuilder()
    .string('lookup_name', 'Search a profile by their CRBT profile name.', false)
    .autocomplete('lookup_name', async ({ lookup_name }) => {
      return (
        await db.profiles.findMany({
          where: {
            name: {
              contains: lookup_name.replace('@', ''),
              mode: 'insensitive',
            },
          },
        })
      ).map((p) => {
        return {
          name: `@${p.name}`,
          value: p.name,
        };
      });
    })
    .user('lookup_user', 'Search a profile by their Discord user ID or name.', false),
  async handle({ lookup_user, lookup_name }) {
    let u: User;
    let profile: APIProfile;

    try {
      if (lookup_user) {
        u = lookup_user;
        profile = (await db.profiles.findFirst({
          where: { id: u.id },
        })) as APIProfile;
      } else if (lookup_name) {
        profile = (await db.profiles.findFirst({
          where: {
            name: {
              equals: lookup_name,
              mode: 'insensitive',
            },
          },
        })) as APIProfile;
        u = this.client.users.cache.get(profile.id) ?? (await this.client.users.fetch(profile.id));
      } else {
        u = this.user;
        profile = (await db.profiles.findFirst({
          where: { id: u.id },
        })) as APIProfile;
      }
    } catch (error) {
      return this.reply(
        CRBTError("Couldn't find a profile with that username. Make sure to use the autocomplete")
      );
    }

    await this.reply({
      embeds: [await renderProfile(profile, u, this.guild, this)],
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
    });
  },
});

export const ctxProfile = UserContextCommand({
  name: 'View CRBT Profile',
  async handle(u) {
    const profile = (await db.profiles.findFirst({
      where: { id: u.id },
    })) as APIProfile;
    this.reply({
      embeds: [await renderProfile(profile, u, this.guild, this)],
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
      ephemeral: u.id !== this.user.id,
    });
  },
});
