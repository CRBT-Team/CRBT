import { badges, emojis } from '$lib/env';
import { icon } from '$lib/env/emojis';
import { avatar } from '$lib/functions/avatar';
import { banner } from '$lib/functions/banner';
import { formatDisplayName, formatUsername } from '$lib/functions/formatUsername';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { keyPerms } from '$lib/functions/keyPerms';
import { localeLower } from '$lib/functions/localeLower';
import { getAllLanguages, t } from '$lib/language';
import { invisibleChar } from '$lib/util/invisibleChar';
import { snowflakeToDate, timestampMention } from '@purplet/utils';
import dedent from 'dedent';
import {
  APIUser,
  MessageFlags,
  PermissionFlagsBits,
  Routes,
  UserFlags,
} from 'discord-api-types/v10';
import {
  EmbedFieldData,
  GuildMember,
  Interaction,
  MessageComponentInteraction,
  UserContextMenuInteraction,
} from 'discord.js';
import { ChatCommand, components, getRestClient, OptionBuilder, UserContextCommand } from 'purplet';
import { ShareResponseBtn } from '../../components/ShareResult';
import { getUser } from '../../settings/user-settings/_helpers';
import { AvatarFormats, AvatarSizes, getTabs, navBar, NavBarContext } from './_navbar';

export default ChatCommand({
  name: 'user info',
  nameLocalizations: getAllLanguages('USER', localeLower),
  description: t('en-US', 'user_info.description'),
  descriptionLocalizations: getAllLanguages('user_info.description'),
  options: new OptionBuilder().user('user', t('en-US', 'USER_TYPE_COMMAND_OPTION_DESCRIPTION'), {
    nameLocalizations: getAllLanguages('USER', localeLower),
    descriptionLocalizations: getAllLanguages('USER_TYPE_COMMAND_OPTION_DESCRIPTION'),
  }),
  async handle({ user }) {
    const u = (await getRestClient().get(Routes.user((user ?? this.user).id))) as APIUser;
    const m = (user ? this.options.getMember('user') : this.member) as GuildMember;

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
  name: 'User Info',
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
  const { badges: discordBadges } = emojis;

  const userFlags: {
    [k: string]: UserFlags;
  } = {
    [discordBadges.verifiedBot]: UserFlags.VerifiedBot,
    [discordBadges.discordStaff]: UserFlags.Staff,
    [discordBadges.partner]: UserFlags.Partner,
    [discordBadges.cerifiedMod]: UserFlags.CertifiedModerator,
    [discordBadges.hypesquad]: UserFlags.Hypesquad,
    [discordBadges.houses.bravery]: UserFlags.HypeSquadOnlineHouse1,
    [discordBadges.houses.brilliance]: UserFlags.HypeSquadOnlineHouse2,
    [discordBadges.houses.balance]: UserFlags.HypeSquadOnlineHouse3,
    [discordBadges.bugHunter1]: UserFlags.BugHunterLevel1,
    [discordBadges.bugHunter2]: UserFlags.BugHunterLevel2,
    [discordBadges.activeDeveloper]: UserFlags.ActiveDeveloper,
    [discordBadges.earlySupporter]: UserFlags.PremiumEarlySupporter,
    [discordBadges.developer]: UserFlags.VerifiedDeveloper,
  };

  return [
    ...(additionalBadges ? additionalBadges.map((b) => badges[b].contents) : []),
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
  const crbtUser = await getUser(user.id);
  const userBadges = getBadgeEmojis(user.flags, crbtUser.crbtBadges);
  const size = AvatarSizes[navCtx.size];
  const format = AvatarFormats[navCtx.format];
  const createdAt = snowflakeToDate(user.id);
  const color =
    ctx instanceof MessageComponentInteraction ? ctx.message.embeds[0].color : await getColor(user);

  const fields: EmbedFieldData[] = [
    {
      name: 'Identity',
      value: dedent`
      Unique username: **${
        user.discriminator === '0' ? user.username : `${user.username}#${user.discriminator}`
      }**
      Global display name: **${user.display_name ?? user.username}**
      ${member?.nickname ? `Server nickname: **${member.nickname}**\n` : ''}
      ${
        user.discriminator === '0' ? icon(color, 'toggleon') : emojis.toggle.off
      } **Uses [the new username system](https://dis.gd/usernames)**`,
    },
  ];

  if (member) {
    const roles = member.roles.cache.filter((r) => r.id !== ctx.guild.id);
    const perms = keyPerms(member.permissions);

    fields.push(
      {
        name: `${t(ctx, 'ROLES')} • ${roles.size}`,
        value: roles.size > 0 ? roles.map((r) => r.toString()).join(' ') : `*${t(ctx, 'NONE')}*`,
      },
      {
        name: t(ctx.locale, 'MAJOR_PERMS'),
        value: hasPerms(member.permissions, PermissionFlagsBits.Administrator, true)
          ? t(ctx, 'PERMISSION_ADMINISTRATOR')
          : perms.length
          ? perms.join(', ')
          : t(ctx, 'NO_PERMS'),
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
          name: `${formatUsername(user)} - ${t(ctx.locale, 'USER_INFO')}`,
          icon_url: avatar(member ?? user, 64),
        },
        title: formatDisplayName(user, member),
        description: userBadges.length > 0 ? `${userBadges.join('‎ ')}${invisibleChar}` : '',
        fields,
        image: {
          url: banner(user, size ?? 2048, format),
        },
        thumbnail: {
          url: avatar(member ?? user, size ?? 256, format),
        },
        footer: {
          text: `${t(ctx, 'ID')}: ${user.id}`,
        },
        color: color,
      },
    ],
    flags: MessageFlags.Ephemeral,
    components: components(
      navBar(navCtx, ctx.locale, 'userinfo', getTabs('userinfo', user, member)),
      ShareResponseBtn(ctx, false)
    ),
  };
}
