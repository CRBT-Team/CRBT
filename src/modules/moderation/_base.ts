import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { colors, emojis, icons } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { createCRBTError, UnknownError } from '$lib/functions/CRBTError';
import { hasPerms } from '$lib/functions/hasPerms';
import { createCRBTmsg } from '$lib/functions/sendCRBTmsg';
import { t } from '$lib/language';
import { ModerationStrikeTypes } from '@prisma/client';
import { timestampMention } from '@purplet/utils';
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
import { getSettings } from '../settings/serverSettings/_helpers';
import { ban } from './ban';
import { kick } from './kick';
import { timeout } from './timeout';

export interface ModerationContext {
  target: User | GuildTextBasedChannel;
  moderator: User;
  guild: Guild;
  type: ModerationStrikeTypes;
  reason?: string;
  expiresAt?: Date;
  messagesDeleted?: number;
  duration?: string;
}

export const ModerationColors = {
  BAN: colors.red,
  TEMPBAN: colors.red,
  CLEAR: colors.white,
  KICK: colors.orange,
  TIMEOUT: colors.yellow,
  WARN: colors.yellow,
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
  ctx: ModerationContext
) {
  const { guild, moderator, target, expiresAt, reason, type, messagesDeleted } = ctx;
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
                type: 'moderation',
                user: moderator,
                subject: `${t(this.guildLocale, `MOD_VERB_${type}`)} from ${guild.name}`,
                message: reason,
                guildName: guild.name,
                expiration: expiresAt,
              }),
              color: ModerationColors[type],
            },
          ],
        })
        .catch((e) => {});

      await prisma.moderationStrikes.create({
        data: {
          createdAt: new Date(),
          moderatorId: moderator.id,
          targetId: target.id,
          type,
          expiresAt,
          reason,
          serverId: guild.id,
        },
      });

      await fetchWithCache(
        `strikes:${this.guildId}`,
        () =>
          prisma.moderationStrikes.findMany({
            where: { serverId: this.guild.id },
          }),
        true
      );

      await this.editReply({
        embeds: [
          {
            title: `${emojis.success} Successfully ${t(
              this.guildLocale,
              `MOD_VERB_${type}`
            ).toLocaleLowerCase(this.guildLocale)} ${target.tag}`,
            color: colors.success,
          },
        ],
      });
    }

    const { modules, modLogsChannel } = await getSettings(guild.id);

    if (modules.moderationLogs && modLogsChannel) {
      const channel = (await guild.client.channels.fetch(modLogsChannel)) as TextChannel;

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
          name: t(this.guildLocale, type === 'CLEAR' ? 'CHANNEL' : 'USER'),
          value: `${target}`,
          inline: true,
        },
        ...(expiresAt
          ? [
              {
                name: t(this.guildLocale, 'EXPIRES_AT'),
                value: `${timestampMention(expiresAt)} • ${timestampMention(expiresAt, 'R')}`,
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
                  name: `${target.tag} was ${t(
                    this.guildLocale,
                    `MOD_VERB_${type}`
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
    (this.replied ? this.editReply : this.reply)(UnknownError(this, e));
  }
}

export function checkModerationPermission(
  this: Interaction,
  target: User | Channel,
  type: ModerationStrikeTypes,
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
  }
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
        error: createCRBTError(
          this,
          `You do not have permission to ${type.toLowerCase()} members.`
        ),
      };
    }
    // Check if bot can execute command
    if (!hasPerms(this.appPermissions, perms[type])) {
      return {
        error: createCRBTError(this, `I do not have permission to ${type.toLowerCase()} members.`),
      };
    }
    // Check if user can ban themselves
    if (!allowSelf && this.user.id === target.id) {
      return {
        error: createCRBTError(this, `You cannot ${type.toLowerCase()} yourself! (╯°□°）╯︵ ┻━┻`),
      };
    }
    // Check if target isn't the owner
    if (target.id === this.guild.ownerId) {
      return {
        error: createCRBTError(this, `You cannot ${type.toLowerCase()} the owner of the server.`),
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
        error: createCRBTError(
          this,
          `You cannot ${type.toLowerCase()} a user with a roles above yours.`
        ),
      };
    }
    // Check if target's hoisting role is above the bot's
    if (
      checkHierarchy &&
      this.client.user.id !== this.guild.ownerId &&
      this.guild.me.roles.highest.comparePositionTo(member.roles.highest) <= 0
    ) {
      return {
        error: createCRBTError(
          this,
          `I cannot ${type.toLowerCase()} a user with roles above mine.`
        ),
      };
    }
  }

  if (type === ModerationStrikeTypes.TIMEOUT) {
    if (member.communicationDisabledUntil) {
      return { error: createCRBTError(this, 'This user is already timed out.') };
    }
  }

  return { error: null };
}
