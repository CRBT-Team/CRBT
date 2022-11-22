import { prisma } from '$lib/db';
import { colors, emojis, icons } from '$lib/env';
import { avatar } from '$lib/functions/avatar';
import { createCRBTmsg } from '$lib/functions/sendCRBTmsg';
import { ModerationStrikeTypes } from '@prisma/client';
import { timestampMention } from '@purplet/utils';
import {
  CommandInteraction,
  Guild,
  GuildTextBasedChannel,
  ModalSubmitInteraction,
  TextChannel,
  User,
} from 'discord.js';
import { getSettings } from '../settings/serverSettings/settings';

export interface ModerationContext {
  target: User | GuildTextBasedChannel;
  moderator: User;
  guild: Guild;
  type: ModerationStrikeTypes;
  reason?: string;
  expiresAt?: Date;
  messagesDeleted?: number;
}

export const ModerationStrikeVerbs = {
  BAN: 'Banned',
  TEMPBAN: 'Temporarily banned',
  CLEAR: 'Cleared messages in',
  KICK: 'Kicked',
  TIMEOUT: 'Timed out',
  WARN: 'Warned',
};

export const ModerationColors = {
  BAN: colors.red,
  TEMPBAN: colors.red,
  CLEAR: colors.white,
  KICK: colors.orange,
  TIMEOUT: colors.yellow,
  WARN: colors.yellow,
};

export async function handleModerationAction(
  this: CommandInteraction | ModalSubmitInteraction,
  { guild, moderator, target, expiresAt, reason, type, messagesDeleted }: ModerationContext
) {
  await this.deferReply();

  await prisma.moderationStrikes.create({
    data: {
      createdAt: new Date(),
      moderatorId: moderator.id,
      targetId: target.id,
      type,
      expiresAt,
      reason,
      server: {
        connectOrCreate: {
          create: { id: guild.id },
          where: { id: guild.id },
        },
      },
    },
  });

  if (target instanceof User) {
    console.log('h');
    await target
      .send({
        embeds: [
          {
            ...createCRBTmsg({
              type: 'moderation',
              user: moderator,
              subject: `${ModerationStrikeVerbs[type]} from ${guild.name}`,
              message: reason,
              guildName: guild.name,
              expiration: expiresAt,
            }),
            color: ModerationColors[type],
          },
        ],
      })
      .catch((e) => {});

    await this.editReply({
      embeds: [
        {
          title: `${emojis.success} Successfully ${ModerationStrikeVerbs[type].toLowerCase()} ${
            target.tag
          }`,
          color: colors.success,
        },
      ],
    });
  }

  const guildSettings = await getSettings(guild.id);
  const modLogsChannelId = guildSettings?.modLogsChannel;

  if ((guildSettings?.modules?.moderationLogs ?? true) && modLogsChannelId) {
    const channel = (await guild.client.channels.fetch(modLogsChannelId)) as TextChannel;

    try {
      if (target instanceof User) {
        channel.send({
          embeds: [
            {
              author: {
                name: `${target.tag} was ${ModerationStrikeVerbs[type].toLowerCase()}`,
                icon_url: avatar(target),
              },
              fields: [
                {
                  name: 'Reason',
                  value: reason ?? '*No reason specified*',
                },
                {
                  name: 'Moderator',
                  value: `${moderator}`,
                  inline: true,
                },
                {
                  name: 'User',
                  value: `${target}`,
                  inline: true,
                },
                ...(expiresAt
                  ? [
                      {
                        name: 'Expires at',
                        value: `${timestampMention(expiresAt)} • ${timestampMention(
                          expiresAt,
                          'R'
                        )}`,
                      },
                    ]
                  : []),
              ],
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
              fields: [
                {
                  name: 'Reason',
                  value: reason ?? '*No reason specified*',
                },
                {
                  name: 'Moderator',
                  value: `${moderator}`,
                  inline: true,
                },
                {
                  name: 'Channel',
                  value: `${target}`,
                  inline: true,
                },
              ],
              color: ModerationColors[type],
            },
          ],
        });
      }
    } catch (e) {}
  }
}
