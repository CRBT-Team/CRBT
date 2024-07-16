import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { colors, emojis } from '$lib/env';
import { UnknownError, createCRBTError } from '$lib/functions/CRBTError';
import { createModNotification } from '$lib/functions/createModNotification';
import { formatUsername } from '$lib/functions/formatUsername';
import { hasPerms } from '$lib/functions/hasPerms';
import { CRBTMessageSourceType, createCRBTmsg } from '$lib/functions/sendCRBTmsg';
import { t } from '$lib/language';
import { dateToSnowflake } from '@purplet/utils';
import { capitalCase } from 'change-case-all';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import {
  Channel,
  CommandInteraction,
  Guild,
  GuildBasedChannel,
  GuildMember,
  GuildTextBasedChannel,
  Interaction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
  TextChannel,
  User,
} from 'discord.js';
import { getGuildSettings } from '../settings/server-settings/_helpers';
import { ban } from './ban';
import { clearMessages } from './clear';
import { kick } from './kick';
import { lockChannel } from './lock';
import { timeout } from './timeout';
import { unlockChannel } from './unlock';

export interface ModerationContext {
  user: User;
  guild: Guild;
  target: User | GuildBasedChannel;
  reason?: string;
  endDate?: Date;
  type: ModerationAction;
  messagesToDelete?: number;
  duration?: string;
  id?: string;
}

export enum ModerationAction {
  UserBan,
  UserTemporaryBan,
  ChannelMessageClear,
  UserKick,
  UserTimeout,
  UserWarn,
  UserReport,
  ChannelLock,
  ChannelUnlock,
  UserUnban,
}

export const ChannelModerationActions = [
  ModerationAction.ChannelMessageClear,
  ModerationAction.ChannelLock,
  ModerationAction.ChannelUnlock,
];

export const moderationVerbStrings: Record<ModerationAction, string> = {
  [ModerationAction.ChannelMessageClear]: 'CLEAR',
  [ModerationAction.UserBan]: 'BAN',
  [ModerationAction.UserKick]: 'KICK',
  [ModerationAction.UserReport]: 'REPORT',
  [ModerationAction.UserTemporaryBan]: 'TEMPBAN',
  [ModerationAction.UserTimeout]: 'TIMEOUT',
  [ModerationAction.UserWarn]: 'WARN',
  [ModerationAction.ChannelLock]: 'LOCK',
  [ModerationAction.ChannelUnlock]: 'UNLOCK',
  [ModerationAction.UserUnban]: 'UNBAN',
};

export const ModerationColors: Record<ModerationAction, number> = {
  [ModerationAction.UserBan]: colors.red,
  [ModerationAction.UserTemporaryBan]: colors.red,
  [ModerationAction.ChannelMessageClear]: colors.white,
  [ModerationAction.UserKick]: colors.orange,
  [ModerationAction.UserTimeout]: colors.yellow,
  [ModerationAction.UserWarn]: colors.yellow,
  [ModerationAction.UserReport]: colors.white,
  [ModerationAction.ChannelLock]: colors.blue,
  [ModerationAction.ChannelUnlock]: colors.green,
  [ModerationAction.UserUnban]: colors.green,
};

type UserModerationFunctionProps = (
  this: CommandInteraction,
  member: GuildMember,
  ctx: ModerationContext,
) => any;
type ChannelModerationFunctionProps = (
  this: CommandInteraction,
  channel: GuildTextBasedChannel,
  ctx: ModerationContext,
) => any;

export const ModerationActions: Partial<
  Record<ModerationAction, UserModerationFunctionProps | ChannelModerationFunctionProps>
> = {
  [ModerationAction.UserBan]: ban,
  [ModerationAction.UserTemporaryBan]: ban,
  [ModerationAction.UserKick]: kick,
  [ModerationAction.UserTimeout]: timeout,
  [ModerationAction.ChannelMessageClear]: clearMessages,
  [ModerationAction.ChannelLock]: lockChannel,
  [ModerationAction.ChannelUnlock]: unlockChannel,
};

export async function handleModerationAction(
  this: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction,
  ctx: ModerationContext,
) {
  await this.deferReply();

  ctx.id = dateToSnowflake(new Date());
  const {
    guild,
    user: moderator,
    target,
    endDate,
    reason,
    type,
    messagesToDelete: messagesDeleted,
  } = ctx;
  const { error } = checkModerationPermission.call(this, target, type);

  if (error) {
    this.editReply(error);
    return;
  }

  try {
    if (ModerationActions[type]) {
      if (target instanceof User && !ChannelModerationActions.includes(type)) {
        // warn the user through their DMs
        await target
          .send({
            embeds: [
              {
                ...createCRBTmsg({
                  source: CRBTMessageSourceType.Moderator,
                  action: type,
                  locale: this.guildLocale,
                  message: reason,
                  guildName: guild.name,
                  endDate,
                }),
                color: ModerationColors[type],
              },
            ],
          })
          .catch((e) => {});

        const member = guild.members.cache.get(target.id);
        //@ts-ignore
        const error = await ModerationActions[type]?.call(this, member, ctx);

        if (error) {
          return this.editReply(error);
        }

        await this.editReply({
          embeds: [
            {
              title: `${emojis.success} Successfully ${t(
                this.guildLocale,
                `MOD_VERB_${moderationVerbStrings[type]}` as any,
              ).toLocaleLowerCase(this.guildLocale)} ${formatUsername(target)}`,
              color: colors.success,
            },
          ],
        });
      } else if (target instanceof Channel && ChannelModerationActions.includes(type)) {
        //@ts-ignore
        const error = await ModerationActions[type]?.call(this, target, ctx);

        if (error) {
          return this.editReply(error);
        }
      }
    }

    await prisma.moderationEntry.create({
      data: {
        id: ctx.id,
        endDate,
        type,
        userId: moderator.id,
        targetId: target.id,
        reason,
        guildId: guild.id,
      },
    });

    // Update cache
    await fetchWithCache(
      `mod_history:${this.guildId}`,
      () =>
        prisma.moderationEntry.findMany({
          where: { guildId: this.guild.id },
        }),
      true,
    );

    const { modules, modLogsChannelId } = await getGuildSettings(guild.id);
    const awareOwnerMember = await prisma.guildMember.findFirst({
      where: {
        guildId: guild.id,
        userId: guild.ownerId,
        moderationNotifications: true,
      },
    });

    if (modules.moderationNotifications) {
      const message = createModNotification(
        {
          type,
          reason,
          guild,
          user: moderator,
          endDate,
          target,
          messagesToDelete: messagesDeleted,
        },
        this.guildLocale,
      );

      // If the owner enabled DM notifications, send them a copy of the modlogs
      const user = await guild.client.users.fetch(awareOwnerMember.userId);

      await user.send(message);

      if (modLogsChannelId) {
        const channel = (await guild.client.channels.fetch(modLogsChannelId)) as TextChannel;

        await channel.send(message);
      }
    }
  } catch (e) {
    this.editReply(UnknownError(this, e));
  }
}

export function checkModerationPermission(
  this: Interaction,
  target: User | Channel,
  type: ModerationAction,
  {
    allowBots,
    allowSelf,
    checkHierarchy,
  }: {
    checkHierarchy?: boolean;
    allowSelf?: boolean;
    allowBots?: boolean;
  } = {
    checkHierarchy: true,
    allowSelf: false,
    allowBots: true,
  },
): { error: any } {
  const member = this.guild.members.cache.get(target.id);
  const isOwner = this.guild.ownerId === this.user.id;

  const perms: Record<ModerationAction, bigint> = {
    [ModerationAction.UserBan]: PermissionFlagsBits.BanMembers,
    [ModerationAction.UserTemporaryBan]: PermissionFlagsBits.BanMembers,
    [ModerationAction.UserKick]: PermissionFlagsBits.KickMembers,
    [ModerationAction.ChannelMessageClear]: PermissionFlagsBits.ManageMessages,
    [ModerationAction.UserTimeout]: PermissionFlagsBits.ModerateMembers,
    [ModerationAction.UserWarn]: PermissionFlagsBits.ModerateMembers,
    [ModerationAction.UserReport]: 0n,
    [ModerationAction.ChannelLock]: PermissionFlagsBits.ManageChannels,
    [ModerationAction.ChannelUnlock]: PermissionFlagsBits.ManageChannels,
    [ModerationAction.UserUnban]: PermissionFlagsBits.BanMembers,
  };

  const verb = capitalCase(moderationVerbStrings[type]);
  // Object.keys(ModerationAction)[type].toLowerCase();

  // Check if user can execute command
  if (!hasPerms(this.memberPermissions, perms[type])) {
    return {
      error: createCRBTError(
        this,
        t(this, 'ERROR_MISSING_PERMISSIONS', {
          PERMISSIONS: `${verb} ${target instanceof User ? 'Members' : 'Channels'}`,
        }),
      ),
    };
  }
  // Check if bot can execute command
  if (!hasPerms(this.appPermissions, perms[type])) {
    return {
      error: createCRBTError(
        this,
        t(this, 'ERROR_BOT_MISSING_PERMISSIONS', {
          permissions: `${verb} ${target instanceof User ? 'Members' : 'Channels'}`,
        }),
      ),
    };
  }

  if (target instanceof User) {
    // Check member exists
    if (!member) {
      return {
        error: createCRBTError(this, 'The user is not in this server.'),
      };
    }
    // Check if user can ban themselves
    if (!allowSelf && this.user.id === target.id) {
      return {
        error: createCRBTError(this, `You cannot ${verb} yourself! (╯°□°）╯︵ ┻━┻`),
      };
    }
    // Check if target isn't the owner
    if (target.id === this.guild.ownerId) {
      return {
        error: createCRBTError(this, `You cannot ${verb} the owner of the server.`),
      };
    }
    // Check if target's hoisting role is above the user's
    if (
      checkHierarchy &&
      !isOwner &&
      this.user.id !== this.guild.ownerId &&
      (this.member as GuildMember).roles.highest.comparePositionTo(member.roles.highest) <= 0
    ) {
      return {
        error: createCRBTError(this, `You cannot ${verb} a user with a roles above yours.`),
      };
    }
    // Check if target's hoisting role is above the bot's
    if (
      checkHierarchy &&
      this.client.user.id !== this.guild.ownerId &&
      this.guild.members.me.roles.highest.comparePositionTo(member.roles.highest) <= 0
    ) {
      return {
        error: createCRBTError(this, `I cannot ${verb} a user with roles above mine.`),
      };
    }

    if (type === ModerationAction.UserTimeout && member.communicationDisabledUntil) {
      return { error: createCRBTError(this, 'This user is already timed out.') };
    }
  }

  return { error: null };
}
