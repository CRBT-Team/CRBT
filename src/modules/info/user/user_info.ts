import { prisma } from '$lib/db';
import { emojis, items } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { banner } from '$lib/functions/banner';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { keyPerms } from '$lib/functions/keyPerms';
import { time } from '$lib/functions/time';
import { t } from '$lib/language';
import { invisibleChar } from '$lib/util/invisibleChar';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import {
  GuildMember,
  Interaction,
  MessageEmbed,
  User,
  UserContextMenuInteraction,
  UserFlags,
} from 'discord.js';
import {
  ChatCommand,
  components,
  OptionBuilder,
  UserContextCommand,
} from 'purplet';
import { AvatarFormats, AvatarSizes, getTabs, navBar, NavBarContext } from './_navbar';

export default ChatCommand({
  name: 'user info',
  description: "Get a user's Discord information.",
  options: new OptionBuilder().user('user', 'User to get info from. Leave blank to get yours.'),
  async handle({ user }) {
    const u = await (user ?? this.user).fetch();
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
        user,
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
  return [
    ...(additionalBadges ? additionalBadges.map((b) => items.badges[b].contents) : []),
    ...flags.toArray()?.map((flag) => {
      switch (flag) {
        case 'VERIFIED_BOT':
          return badges.verifiedBot;
        case 'DISCORD_EMPLOYEE':
          return badges.discordStaff;
        case 'PARTNERED_SERVER_OWNER':
          return badges.partner;
        case 'DISCORD_CERTIFIED_MODERATOR':
          return badges.cerifiedMod;
        case 'HYPESQUAD_EVENTS':
          return badges.hypesquad;
        case 'HOUSE_BRILLIANCE':
          return badges.houses.brilliance;
        case 'HOUSE_BALANCE':
          return badges.houses.balance;
        case 'HOUSE_BRAVERY':
          return badges.houses.bravery;
        case 'BUGHUNTER_LEVEL_1':
          return badges.bugHunter1;
        case 'BUGHUNTER_LEVEL_2':
          return badges.bugHunter1;
        case 'EARLY_SUPPORTER':
          return badges.earlySupporter;
        case 'EARLY_VERIFIED_BOT_DEVELOPER':
          return badges.developer;
      }
    }),
  ].filter(Boolean);
}

export async function renderUser(
  ctx: Interaction,
  user: User,
  navCtx: NavBarContext,
  member?: GuildMember
) {
  const crbtUser = await prisma.user.findFirst({
    where: { id: user.id },
    select: { crbtBadges: true },
  });

  const userBadges = getBadgeEmojis(user.flags, crbtUser?.crbtBadges);
  const size = AvatarSizes[navCtx.size];
  const format = AvatarFormats[navCtx.format];

  const e = new MessageEmbed()
    .setAuthor({
      name: t(ctx.locale, 'USER_INFO_EMBED_TITLE').replace('<USER>', user.tag),
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

    e.addFields({
      name: `${t(ctx.locale, 'USER_INFO_ROLES')} • ${roles.size}`,
      value: roles.size > 0
        ? roles.map((r) => r.toString()).join(' ')
        : t(ctx.locale, 'USER_INFO_NO_ROLES')
    }, {
      name: t(ctx.locale, 'USER_INFO_PERMS'),
      value: hasPerms(member, PermissionFlagsBits.Administrator) ||
        member.permissions.toArray().length === 0
        ? 'Administrator (all permissions)'
        : keyPerms(member.permissions).join(', ')
    }, {
      name: t(ctx.locale, 'USER_INFO_CREATED_AT'),
      value: `${time(user.createdAt)}\n${time(user.createdAt, true)}`,
      inline: true
    }, {
      name: t(ctx.locale, 'USER_INFO_JOINED_SERVER'),
      value: `${time(member.joinedAt)}\n${time(member.joinedAt, true)}`,
      inline: true
    });

  } else {
    e.addFields({
      name: t(ctx.locale, 'USER_INFO_CREATED_AT'),
      value: `${time(user.createdAt)} • ${time(user.createdAt, true)}`
    });
  }
  return {
    embeds: [e],
    components: components(
      navBar(navCtx, ctx.locale, 'userinfo', getTabs('userinfo', user, member)),
    ),
  };
}
