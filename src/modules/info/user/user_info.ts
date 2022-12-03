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
import { EmbedFieldData, GuildMember, Interaction, UserContextMenuInteraction } from 'discord.js';
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
  const createdAt = snowflakeToDate(user.id);

  const fields: EmbedFieldData[] = [
    {
      name: t(ctx, 'ID'),
      value: user.id,
    },
  ];

  if (member) {
    const roles = member.roles.cache.filter((r) => r.id !== ctx.guild.id);

    if (member.nickname) {
      fields.push({
        name: t(ctx, 'SERVER_NICKNAME'),
        value: member.nickname,
      });
    }

    fields.push(
      {
        name: `${t(ctx, 'ROLES')} • ${roles.size}`,
        value: roles.size > 0 ? roles.map((r) => r.toString()).join(' ') : t(ctx, 'USER_NO_ROLES'),
      },
      {
        name: t(ctx.locale, 'MAJOR_PERMS'),
        value:
          hasPerms(member, PermissionFlagsBits.Administrator) ||
          member.permissions.toArray().length === 0
            ? 'Administrator (all permissions)'
            : keyPerms(member.permissions).join(', '),
      },
      {
        name: t(ctx, 'JOINED_DISCORD'),
        value: `${timestampMention(createdAt)}\n${timestampMention(createdAt, 'R')}`,
        inline: true,
      },
      {
        name: t(ctx, 'JOINED_SERVER'),
        value: `${timestampMention(member.joinedAt)}\n${timestampMention(member.joinedAt, 'R')}`,
        inline: true,
      }
    );
  } else {
    fields.push({
      name: t(ctx.locale, 'JOINED_DISCORD'),
      value: `${timestampMention(createdAt)} • ${timestampMention(createdAt, 'R')}`,
    });
  }

  return {
    embeds: [
      {
        author: {
          name: `${user.username}#${user.discriminator} • ${t(ctx.locale, 'USER_INFO')}`,
          icon_url: avatar(member ?? user, 64),
        },
        description: userBadges.length > 0 ? `${userBadges.join('‎ ')}${invisibleChar}` : '',
        fields,
        image: {
          url: banner(user, size ?? 2048, format),
        },
        thumbnail: {
          url: avatar(member ?? user, size ?? 256, format),
        },
        color: await getColor(user),
      },
    ],
    components: components(
      navBar(navCtx, ctx.locale, 'userinfo', getTabs('userinfo', user, member))
    ),
  };
}
