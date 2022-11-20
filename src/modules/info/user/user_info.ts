import { prisma } from '$lib/db';
import { emojis, items } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { banner } from '$lib/functions/banner';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { keyPerms } from '$lib/functions/keyPerms';
import { t } from '$lib/language';
import { invisibleChar } from '$lib/util/invisibleChar';
import { snowflakeToDate, timestampMention } from '@purplet/utils';
import { APIUser, PermissionFlagsBits, Routes, UserFlags } from 'discord-api-types/v10';
import { GuildMember, Interaction, MessageEmbed, UserContextMenuInteraction } from 'discord.js';
import { ChatCommand, components, getRestClient, OptionBuilder, UserContextCommand } from 'purplet';
import { AvatarFormats, AvatarSizes, getTabs, navBar, NavBarContext } from './_navbar';

export default ChatCommand({
  name: 'user info',
  description: "Get a user's Discord information.",
  options: new OptionBuilder().user('user', 'User to get info from. Leave blank to get yours.'),
  async handle({ user }) {
    const u = (await getRestClient().get(Routes.user((user ?? this.user).id))) as APIUser;
    const m = (user ? this.options.getMember('user') : this.member) as GuildMember;

    // enum UserStatus {
    //   online = 'https://cdn.discordapp.com/attachments/782584672772423684/851805512370880512/unknown.png',
    //   idle = 'https://cdn.discordapp.com/attachments/782584672772423684/851805544507113542/unknown.png',
    //   dnd = 'https://cdn.discordapp.com/attachments/782584672772423684/851805534527946762/unknown.png',
    //   offline = 'https://cdn.discordapp.com/attachments/782584672772423684/851805558503243826/unknown.png',
    //   invisible = 'https://cdn.discordapp.com/attachments/782584672772423684/851805558503243826/unknown.png',
    // }

    await this.reply(
      await renderUser(
        this,
        u,
        {
          targetId: u.id,
          userId: this.user.id,
        },
        m
      )
    );
  },
});

export const ctxCommand = UserContextCommand({
  name: 'Get User Info',
  async handle(user) {
    const member = (this as UserContextMenuInteraction).targetMember as GuildMember;

    await this.reply({
      ...(await renderUser(
        this,
        (await getRestClient().get(Routes.user(user.id))) as APIUser,
        {
          targetId: user.id,
          userId: this.user.id,
        },
        member
      )),
      ephemeral: true,
    });
  },
});

export function getBadgeEmojis(flags: UserFlags, additionalBadges?: string[]) {
  const { badges } = emojis;

  const userFlags: {
    [k: string]: UserFlags;
  } = {
    [badges.verifiedBot]: UserFlags.VerifiedBot,
    [badges.discordStaff]: UserFlags.Staff,
    [badges.partner]: UserFlags.Partner,
    [badges.cerifiedMod]: UserFlags.CertifiedModerator,
    [badges.hypesquad]: UserFlags.Hypesquad,
    [badges.houses.bravery]: UserFlags.HypeSquadOnlineHouse1,
    [badges.houses.brilliance]: UserFlags.HypeSquadOnlineHouse2,
    [badges.houses.balance]: UserFlags.HypeSquadOnlineHouse3,
    [badges.bugHunter1]: UserFlags.BugHunterLevel1,
    [badges.bugHunter2]: UserFlags.BugHunterLevel2,
    [badges.activeDeveloper]: UserFlags.ActiveDeveloper,
    [badges.earlySupporter]: UserFlags.PremiumEarlySupporter,
    [badges.developer]: UserFlags.VerifiedDeveloper,
  };

  return [
    ...(additionalBadges ? additionalBadges.map((b) => items.badges[b].contents) : []),
    ...Object.entries(userFlags).reduce((acc, [key, value]) => {
      if ((flags & value) === value) {
        acc.push(key);
      }
      return acc;
    }, []),
  ].filter(Boolean);
}

export async function renderUser(
  ctx: Interaction,
  user: APIUser,
  navCtx: NavBarContext,
  member?: GuildMember
) {
  const crbtUser = await prisma.user.findFirst({
    where: { id: user.id },
    select: { crbtBadges: true },
  });

  const userBadges = getBadgeEmojis(user.public_flags, crbtUser?.crbtBadges);
  const size = AvatarSizes[navCtx.size];
  const format = AvatarFormats[navCtx.format];

  const e = new MessageEmbed()
    .setAuthor({
      name: t(ctx.locale, 'USER_INFO_EMBED_TITLE', {
        USER: `${user.username}#${user.discriminator}`,
      }),
      iconURL: avatar(member ?? user, 64),
    })
    .setDescription(userBadges.length > 0 ? `${userBadges.join('‎ ')}${invisibleChar}` : '')
    .addField('ID', user.id)
    .setImage(banner(user, size ?? 2048, format))
    .setThumbnail(avatar(member ?? user, size ?? 256, format))
    .setColor(await getColor(user));

  if (member) {
    const roles = member.roles.cache.filter((r) => r.id !== ctx.guild.id);

    if (member.nickname) e.addField(t(ctx.locale, 'USER_INFO_NICKNAME'), member.nickname);

    e.addFields(
      {
        name: `${t(ctx.locale, 'USER_INFO_ROLES')} • ${roles.size}`,
        value:
          roles.size > 0
            ? roles.map((r) => r.toString()).join(' ')
            : t(ctx.locale, 'USER_INFO_NO_ROLES'),
      },
      {
        name: t(ctx.locale, 'USER_INFO_PERMS'),
        value:
          hasPerms(member, PermissionFlagsBits.Administrator) ||
          member.permissions.toArray().length === 0
            ? 'Administrator (all permissions)'
            : keyPerms(member.permissions).join(', '),
      },
      {
        name: t(ctx.locale, 'USER_INFO_CREATED_AT'),
        value: `${timestampMention(snowflakeToDate(user.id))}\n${timestampMention(
          snowflakeToDate(user.id),
          'R'
        )}`,
        inline: true,
      },
      {
        name: t(ctx.locale, 'USER_INFO_JOINED_SERVER'),
        value: `${timestampMention(member.joinedAt)}\n${timestampMention(member.joinedAt, 'R')}`,
        inline: true,
      }
    );
  } else {
    e.addFields({
      name: t(ctx.locale, 'USER_INFO_CREATED_AT'),
      value: `${timestampMention(snowflakeToDate(user.id))} • ${timestampMention(
        snowflakeToDate(user.id),
        'R'
      )}`,
    });
  }
  return {
    embeds: [e],
    components: components(
      navBar(navCtx, ctx.locale, 'userinfo', getTabs('userinfo', user, member))
    ),
  };
}
