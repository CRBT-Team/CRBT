import { cache } from '$lib/cache';
import { CRBTUser } from '$lib/classes/CRBTUser';
import { db, emojis } from '$lib/db';
import { avatar } from '$lib/functions/avatar';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { row } from '$lib/functions/row';
import { trimURL } from '$lib/functions/trimURL';
import { getStrings } from '$lib/language';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import { Interaction, MessageEmbed } from 'discord.js';
import { ChatCommand, components, OptionBuilder, UserContextCommand } from 'purplet';
import { navBar } from '../components/navBar';
import { EditProfileBtn } from './editProfile';

dayjs.extend(relativeTime);

const { meta, ctxMeta } = getStrings('en-US').profile;

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
    const { errors } = getStrings(this.locale).profile;

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
      ephemeral: true,
      // ephemeral: !u.equals(this.user),
    });
  },
});

export const renderProfile = async (
  profile: CRBTUser,
  ctx: Interaction,
  navCtx?: { userId: string; cmdUID: string }
) => {
  const { strings } = getStrings(ctx.locale).profile;
  await import(`dayjs/locale/${ctx.locale.split('-')[0]}.js`);

  const e = new MessageEmbed()
    .setAuthor({
      name: profile.user.tag,
      // name: strings.EMBED_TITLE.replace('<USER>', profile.user.tag),
      iconURL: avatar(profile.user, 64),
    })
    .setTitle(
      profile?.name
        ? `@${profile.name}${profile?.verified ? ` ${emojis.verified}` : ''}`
        : profile.user.username
    )
    .setDescription(profile?.bio ?? '')
    .setThumbnail(avatar(profile.user, 256))
    .setImage(profile && profile.banner ? profile.banner.url : null)
    .setFooter({
      text: strings.EMBED_FOOTER.replace('<PURPLETS>', `${profile.purplets ?? 0}`),
    })
    .setColor(await getColor(profile.user));

  if (profile?.birthday) {
    const bday = dayjs(profile.birthday);
    e.addField(
      strings.BIRTHDAY,
      `<t:${bday.unix()}:D> • ${bday
        .year(dayjs().year())
        .locale(ctx.locale.split('-')[0])
        .fromNow()}`
    );
  }

  if (profile?.badges && profile?.badges.length > 0) {
    e.addField(
      strings.BADGES.replace('<NUMBER>', `${profile.badges.length}`),
      profile.badges.join('‎ ')
    );
  }

  if (profile?.pronouns) {
    e.addField(strings.PRONOUNS, profile.pronouns, true);
  }

  if (profile?.url) {
    e.addField(strings.WEBSITE, `**[${trimURL(profile.url)}](${profile.url})**`, true);
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
