import { prisma } from '$lib/db';
import { colors } from '$lib/env';
import { createModNotification } from '$lib/functions/createModNotification';
import { CRBTMessageSourceType, createCRBTmsg } from '$lib/functions/sendCRBTmsg';
import { ModerationEntry } from '@prisma/client';
import { dateToSnowflake, snowflakeToDate, timestampMention } from '@purplet/utils';
import { Client, TextChannel } from 'discord.js';
import { ModerationAction } from '../../modules/moderation/_base';
import { getGuildSettings } from '../../modules/settings/server-settings/_helpers';

export async function handleTempBan(entry: ModerationEntry, client: Client) {
  const guild = await client.guilds.fetch(entry.guildId);
  const target = await client.users.fetch(entry.targetId);
  const locale = 'en-US';

  const newEntry: ModerationEntry = {
    guildId: entry.guildId,
    targetId: entry.targetId,
    details: null,
    endDate: null,
    // TODO: localize reason
    reason: `Scheduled unban from <@${entry.userId}> (originally banned on ${timestampMention(
      snowflakeToDate(entry.id),
    )})`,
    type: ModerationAction.UserUnban,
    userId: client.user.id,
    id: dateToSnowflake(new Date()),
  };

  try {
    await guild.members.unban(entry.targetId);

    await prisma.moderationEntry.create({
      data: newEntry,
    });

    await target
      .send({
        embeds: [
          {
            ...createCRBTmsg({
              source: CRBTMessageSourceType.Moderator,
              action: newEntry.type,
              locale,
              guildName: guild.name,
              endDate: null,
            }),
            color: colors.success,
          },
        ],
      })
      .catch(() => {});

    const { modules, modLogsChannelId } = await getGuildSettings(guild.id);

    if (modules.moderationNotifications && modLogsChannelId) {
      const channel = (await guild.client.channels.fetch(modLogsChannelId)) as TextChannel;

      const message = createModNotification(
        {
          guild,
          target,
          user: target,
          type: newEntry.type,
          reason: newEntry.reason,
        },
        locale,
      );

      await channel.send(message);
    }
  } catch (e) {
    console.error(e);
  }
  return;
}
