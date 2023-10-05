import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { colors, emojis, icons } from '$lib/env';
import { UnknownError, createCRBTError } from '$lib/functions/CRBTError';
import { avatar } from '$lib/functions/avatar';
import { formatUsername } from '$lib/functions/formatUsername';
import { hasPerms } from '$lib/functions/hasPerms';
import { CRBTMessageSourceType, createCRBTmsg } from '$lib/functions/sendCRBTmsg';
import { t } from '$lib/language';
import { ModerationStrikeTypes } from '@prisma/client';
import { dateToSnowflake, timestampMention } from '@purplet/utils';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import {
  Channel,
  CommandInteraction,
  Guild,
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
import { kick } from './kick';
import { timeout } from './timeout';

export interface ModerationContext {
  user: User;
  guild: Guild;
  target: User | GuildTextBasedChannel;
  reason?: string;
  endDate?: Date;
  type: ModerationAction;
  messagesDeleted?: number;
  duration?: string;
}

export enum ModerationAction {
  UserBan,
  UserTemporaryBan,
  ChannelMessageClear,
  UserKick,
  UserTimeout,
  UserWarn,
  UserReport,
}

export const moderationVerbStrings = {
  [ModerationAction.ChannelMessageClear]: 'CLEAR',
  [ModerationAction.UserBan]: 'BAN',
  [ModerationAction.UserKick]: 'KICK',
  [ModerationAction.UserReport]: 'REPORT',
  [ModerationAction.UserTemporaryBan]: 'TEMPBAN',
  [ModerationAction.UserTimeout]: 'TIMEOUT',
  [ModerationAction.UserWarn]: 'WARN',
};

export const ModerationColors = {
  [ModerationAction.UserBan]: colors.red,
  [ModerationAction.UserTemporaryBan]: colors.red,
  [ModerationAction.ChannelMessageClear]: colors.white,
  [ModerationAction.UserKick]: colors.orange,
  [ModerationAction.UserTimeout]: colors.yellow,
  [ModerationAction.UserWarn]: colors.yellow,
};

export const ModerationActions: Partial<
  Record<
    ModerationStrikeTypes,
    (this: Interaction, member: GuildMember, ctx: ModerationContext) => any
  >
> = {
  BAN: ban,
  KICK: kick,
  TIMEOUT: timeout,
};

export async function handleModerationAction(
  this: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction,
  ctx: ModerationContext,
) {
  const { guild, user: moderator, target, endDate, reason, type, messagesDeleted } = ctx;
  const { error } = checkModerationPermission.call(this, target, type);

  if (error) {
    return this.reply(error);
  }

  try {
    if (target instanceof User) {
      const member = guild.members.cache.get(target.id);

      const error = ModerationActions[type]?.call(this, member, ctx);

      if (error) {
        return this.reply(error);
      }

      await this.deferReply();

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

      await prisma.moderationEntry.create({
        data: {
          id: dateToSnowflake(new Date()),
          endDate,
          type,
          userId: moderator.id,
          targetId: target.id,
          reason,
          guildId: guild.id,
        },
      });

      await fetchWithCache(
        `strikes:${this.guildId}`,
        () =>
          prisma.moderationEntry.findMany({
            where: { guildId: this.guild.id },
          }),
        true,
      );

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
    }

    const { modules, modLogsChannelId } = await getGuildSettings(guild.id);

    if (modules.moderationNotifications && modLogsChannelId) {
      const channel = (await guild.client.channels.fetch(modLogsChannelId)) as TextChannel;

      const fields = [
        {
          name: t(this.guildLocale, 'REASON'),
          value: reason ?? '*No reason specified*',
        },
        {
          name: t(this.guildLocale, 'MODERATOR'),
          value: `${moderator}`,
          inline: true,
        },
        {
          name: t(
            this.guildLocale,
            type === ModerationAction.ChannelMessageClear ? 'CHANNEL' : 'USER',
          ),
          value: `${target}`,
          inline: true,
        },
        ...(endDate
          ? [
              {
                name: t(this.guildLocale, 'END_DATE'),
                value: `${timestampMention(endDate)} • ${timestampMention(endDate, 'R')}`,
              },
            ]
          : []),
      ];

      try {
        if (target instanceof User) {
          channel.send({
            embeds: [
              {
                author: {
                  name: `${formatUsername(target)} was ${t(
                    this.guildLocale,
                    `MOD_VERB_${Object.keys(ModerationAction)[type]}` as any,
                  ).toLocaleLowerCase(this.locale)}`,
                  icon_url: avatar(target),
                },
                fields,
                color: ModerationColors[type],
              },
            ],
          });
        } else {
          channel.send({
            embeds: [
              {
                author: {
                  name: `${messagesDeleted} messages were deleted in #${target.name}`,
                  icon_url: icons.channels.text,
                },
                fields,
                color: ModerationColors[type],
              },
            ],
          });
        }
      } catch (e) {}
    }
  } catch (e) {
    (this.replied || this.deferred ? this.editReply : this.reply)(UnknownError(this, e));
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

  const perms: Partial<Record<ModerationStrikeTypes, bigint>> = {
    BAN: PermissionFlagsBits.BanMembers,
    KICK: PermissionFlagsBits.KickMembers,
    CLEAR: PermissionFlagsBits.ManageMessages,
    TIMEOUT: PermissionFlagsBits.ModerateMembers,
    WARN: PermissionFlagsBits.ModerateMembers,
    REPORT: 0n,
  };

  const verb = moderationVerbStrings[type].toLowerCase();
  // Object.keys(ModerationAction)[type].toLowerCase();

  if (target instanceof User) {
    // Check member exists
    if (!member) {
      return {
        error: createCRBTError(this, 'The user is not in this server.'),
      };
    }
    // Check if user can execute command
    if (!hasPerms(this.memberPermissions, perms[type])) {
      return {
        error: createCRBTError(this, `You do not have permission to ${verb} members.`),
      };
    }
    // Check if bot can execute command
    if (!hasPerms(this.appPermissions, perms[type])) {
      return {
        error: createCRBTError(this, `I do not have permission to ${verb} members.`),
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
      this.guild.me.roles.highest.comparePositionTo(member.roles.highest) <= 0
    ) {
      return {
        error: createCRBTError(this, `I cannot ${verb} a user with roles above mine.`),
      };
    }
  }

  if (type === ModerationAction.UserTimeout && member.communicationDisabledUntil) {
    return { error: createCRBTError(this, 'This user is already timed out.') };
  }

  return { error: null };
}
