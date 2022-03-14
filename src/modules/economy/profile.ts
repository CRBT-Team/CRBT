import { cache } from '$lib/cache';
import { db, emojis, items } from '$lib/db';
import { avatar } from '$lib/functions/avatar';
import { CRBTError } from '$lib/functions/CRBTError';
import { CRBTscriptParser } from '$lib/functions/CRBTscriptParser';
import { getColor } from '$lib/functions/getColor';
import { row } from '$lib/functions/row';
import { trimURL } from '$lib/functions/trimURL';
import { APIProfile } from '$lib/types/CRBT/APIProfile';
import dayjs from 'dayjs';
import {
  Guild,
  Interaction,
  InteractionReplyOptions,
  MessageButton,
  MessageEmbed,
  User,
} from 'discord.js';
import fetch from 'node-fetch';
import { ChatCommand, components, OptionBuilder, UserContextCommand } from 'purplet';
import { EditProfileBtn } from './editProfile';

export const renderProfile = async (
  profile: APIProfile,
  user: User,
  guild: Guild,
  ctx: Interaction
): Promise<InteractionReplyOptions> => {
  const pronouns = (
    (await fetch(`https://pronoundb.org/api/v1/lookup?platform=discord&id=${user.id}`).then((r) =>
      r.json()
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
      profile?.bio
        ? await CRBTscriptParser(profile.bio, user, profile, guild)
        : user.equals(ctx.user)
        ? 'You don\'t have a bio! Set yourself one by clicking "Edit Profile" below.'
        : "*This user doesn't have a bio yet...*"
    )
    .setThumbnail(avatar(user, 256))
    .setImage(
      profile && profile.crbt_banner
        ? `https://crbt.ga/banners/${items.banners[profile.crbt_banner].season}/${
            profile.crbt_banner
          }.png`
        : null
    )
    .setColor(await getColor(user));

  if (profile?.crbt_badges && profile?.crbt_badges.length > 0) {
    e.addField(
      `Badges (${profile.crbt_badges.length})`,
      profile.crbt_badges.map((badge) => items.badges[badge].contents).join(' '),
      profile.crbt_badges.length < 6
    );
  }
  e.addField('Pronouns', Pronouns[pronouns].replace('username', user.username), true);

  if (profile?.birthday) {
    const bday = dayjs(profile.birthday);
    e.addField(
      'Birthday',
      `<t:${bday.unix()}:D> • <t:${bday.year(dayjs().year()).unix()}:R>`,
      false
    );
  }
  if (profile?.url) {
    e.addField('Website', `**[${trimURL(profile.url)}](${profile.url})**`, true);
  }
  if (profile?.location) {
    e.addField('Location', profile.location, true);
  }

  return {
    embeds: [e],
    components: components(
      row(
        profile?.url
          ? new MessageButton()
              .setStyle('LINK')
              .setLabel(trimURL(profile.url))
              .setURL(profile.url)
              .setEmoji('🔗')
          : null,

        user.equals(ctx.user)
          ? new EditProfileBtn(user.id).setStyle('PRIMARY').setEmoji('✏️').setLabel('Edit Profile')
          : null
      )
    ),
    ephemeral: !user.equals(ctx.user),
  };
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
      return cache
        .get<string[]>('profiles')
        .filter((name) => name.toLowerCase().includes(lookup_name.replace('@', '')))
        .map((name) => ({ name: `@${name}`, value: name }));
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
        CRBTError(
          "Couldn't find a profile with that username. Make sure to use the autocomplete to find profiles!"
        )
      );
    }

    await this.reply(await renderProfile(profile, u, this.guild, this));
  },
});

export const ctxProfile = UserContextCommand({
  name: 'View CRBT Profile',
  async handle(u) {
    const profile = (await db.profiles.findFirst({
      where: { id: u.id },
    })) as APIProfile;

    await this.reply(await renderProfile(profile, u, this.guild, this));
  },
});
