import { cache } from '$lib/cache';
import { CRBTUser } from '$lib/classes/CRBTUser';
import { db, emojis } from '$lib/db';
import { avatar } from '$lib/functions/avatar';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { row } from '$lib/functions/row';
import { trimURL } from '$lib/functions/trimURL';
import { languages } from '$lib/language';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import { Interaction, MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { ChatCommand, components, OptionBuilder, UserContextCommand } from 'purplet';
import { navBar } from '../components/navBar';
import { EditProfileBtn } from './editProfile';

dayjs.extend(relativeTime);

const { meta, ctxMeta } = languages['en-US'].profile;

export default ChatCommand({
  ...meta,
  options: new OptionBuilder()
    .string('lookup_name', meta.options[0].description, false)
    .autocomplete('lookup_name', async ({ lookup_name }) => {
      return cache
        .get<string[]>('profiles')
        .filter((name) => name.toLowerCase().includes(lookup_name.replace('@', '')))
        .map((name) => ({ name: `@${name}`, value: name }));
    })
    .user('lookup_discord', meta.options[1].description, false),
  async handle({ lookup_discord, lookup_name }) {
    const { errors } = languages[this.locale].profile;

    let profile: CRBTUser;

    try {
      if (lookup_discord) {
        const profileData = await db.profiles.findFirst({
          where: { id: lookup_discord.id },
        });
        profile = new CRBTUser(lookup_discord, profileData);
      } else if (lookup_name) {
        const profileData = await db.profiles.findFirst({
          where: {
            name: {
              equals: lookup_name,
              mode: 'insensitive',
            },
          },
        });

        const user =
          this.client.users.cache.get(profileData.id) ??
          (await this.client.users.fetch(profileData.id));
        profile = new CRBTUser(user, profileData);
      } else {
        const profileData = await db.profiles.findFirst({
          where: { id: this.user.id },
        });
        profile = new CRBTUser(this.user, profileData);
      }
    } catch (error) {
      console.error(error);
      return this.reply(CRBTError(errors.NOT_FOUND));
    }

    await this.reply(await renderProfile(profile, this));
  },
});

export const ctxProfile = UserContextCommand({
  ...ctxMeta,
  async handle(u) {
    const profile = new CRBTUser(
      u,
      await db.profiles.findFirst({
        where: { id: u.id },
      })
    );

    await this.reply({
      ...(await renderProfile(profile, this)),
      ephemeral: !u.equals(this.user),
    });
  },
});

export const renderProfile = async (
  profile: CRBTUser,
  ctx: Interaction,
  navCtx?: { userId: string; cmdUID: string }
) => {
  const { strings, pronouns: Pronouns } = languages[ctx.locale].profile;
  await import(`dayjs/locale/${ctx.locale.split('-')[0]}.js`);

  if (!profile.pronouns) {
    profile.pronouns = (
      (await fetch(`https://pronoundb.org/api/v1/lookup?platform=discord&id=${profile.id}`).then(
        (r) => r.json()
      )) as any
    ).pronouns;

    await db.profiles.update({
      data: { pronouns: profile.pronouns },
      where: { id: profile.id },
    });
  }

  const e = new MessageEmbed()
    .setAuthor({
      name: strings.EMBED_TITLE.replace('<USER>', profile.user.tag),
      iconURL: avatar(profile.user, 64),
    })
    .setTitle(
      profile?.name
        ? `@${profile.name}${profile?.verified ? ` ${emojis.verified}` : ''}`
        : profile.user.username
    )
    .setDescription(profile?.bio ? await profile.parseBio() : '')
    .setThumbnail(avatar(profile.user, 256))
    .setImage(profile && profile.banner ? profile.banner.url : null)
    .setFooter({
      text: strings.EMBED_FOOTER.replace('<PURPLETS>', `${profile.purplets}`),
    })
    .setColor(await getColor(profile.user));

  if (profile?.badges && profile?.badges.length > 0) {
    e.addField(
      strings.BADGES.replace('<NUMBER>', `${profile.badges.length}`),
      profile.badges.join('‎ '),
      profile.badges.length < 6
    );
  }
  e.addField(
    strings.PRONOUNS,
    Pronouns[profile.pronouns].replace('<USERNAME>', profile?.name ?? profile.user.username),
    true
  );

  if (profile?.birthday) {
    const bday = dayjs(profile.birthday);
    e.addField(
      strings.BIRTHDAY,
      `<t:${bday.unix()}:D> • ${bday
        .year(dayjs().year())
        .locale(ctx.locale.split('-')[0])
        .fromNow()}`,
      false
    );
  }
  if (profile?.url) {
    e.addField(strings.WEBSITE, `**[${trimURL(profile.url)}](${profile.url})**`, true);
  }
  if (profile?.location) {
    e.addField(strings.LOCATION, profile.location, true);
  }

  return {
    embeds: [e],
    components: profile.user.equals(ctx.user)
      ? components(
          navBar(navCtx ?? { userId: profile.id, cmdUID: ctx.user.id }, ctx.locale, 'profile'),
          row(
            new EditProfileBtn(profile.id)
              .setStyle('PRIMARY')
              .setEmoji('✏️')
              .setLabel(strings.BUTTON_EDIT_PROFILE)
          )
        )
      : components(
          navBar(navCtx ?? { userId: profile.id, cmdUID: ctx.user.id }, ctx.locale, 'profile')
        ),
  };
};
