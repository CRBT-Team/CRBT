import { db, emojis, icons } from '$lib/db';
import { t } from '$lib/language';
import { timeouts, TimeoutTypes } from '@prisma/client';
import { randomUUID } from 'crypto';
import dayjs from 'dayjs';
import { GuildTextBasedChannel, MessageButton, MessageEmbed, TextChannel } from 'discord.js';
import { components, getDiscordClient, row } from 'purplet';
import { SnoozeButton } from '../../modules/components/RemindButton';
import { endGiveaway } from '../../modules/giveaways/giveaway';
import { endPoll } from '../../modules/polls/poll';
import { getColor } from './getColor';
import { setLongerTimeout } from './setLongerTimeout';

export interface TimeoutData {
  TEMPBAN: {
    userId: string;
    guildId: string;
    reason: string;
  };
  REMINDER: {
    destination: string;
    subject: string;
    userId: string;
    url: string;
  };
  POLL: {
    creatorId: string;
    choices: string[][];
  };
  GIVEAWAY: {
    creatorId: string;
    participants: string[];
  };
}

export type FullDBTimeout<T extends TimeoutTypes> = Omit<timeouts, 'id' | 'data'> & {
  id?: string | undefined;
  type: T;
  data: TimeoutData[T];
};

export type RawDBTimeout = Omit<timeouts, 'id' | 'data'> & {
  id: string | undefined;
  // so that typescript doesnt get mad
  data: any;
};

export async function setDbTimeout<T extends TimeoutTypes>(
  timeout: FullDBTimeout<T> | RawDBTimeout,
  loadOnly: boolean = false
): Promise<FullDBTimeout<T>> {
  const client = getDiscordClient();

  timeout.id = timeout.id ?? randomUUID();

  setLongerTimeout(async () => {
    const timeoutData = (await db.timeouts.findFirst({
      where: { id: timeout.id },
    })) as FullDBTimeout<T>;
    if (!timeoutData) return;

    switch (timeout.type) {
      case 'TEMPBAN': {
        const { data } = timeoutData as FullDBTimeout<'TEMPBAN'>;
        const guild = client.guilds.cache.get(data.guildId);
        await guild.members.unban(data.userId);
        break;
      }
      case 'GIVEAWAY': {
        const { data } = timeoutData as FullDBTimeout<'GIVEAWAY'>;
        const [channelId, messageId] = timeoutData.id.split('/');
        const channel = client.channels.cache.get(channelId) as TextChannel;
        const msg = channel ? await channel.messages.fetch(messageId).catch(() => null) : undefined;
        if (!msg) return;

        endGiveaway(data, msg, timeoutData.locale);
        break;
      }
      case 'POLL': {
        const { data } = timeoutData as FullDBTimeout<'POLL'>;
        const [channelId, messageId] = timeoutData.id.split('/');
        const channel = client.channels.cache.get(channelId) as TextChannel;
        const msg = channel ? await channel.messages.fetch(messageId).catch(() => null) : undefined;
        if (!msg) return;

        endPoll(data, msg, timeoutData.locale);
        break;
      }
      case 'REMINDER': {
        const { JUMP_TO_MSG } = t(timeout.locale, 'genericButtons');
        const { strings } = t(timeout.locale, 'remind me');
        const { data } = timeoutData as FullDBTimeout<'REMINDER'>;
        const user = await client.users.fetch(data.userId);
        const dest =
          data.destination === 'dm'
            ? user
            : ((await client.channels.fetch(data.url.split('/')[1])) as GuildTextBasedChannel);

        const unix = Math.floor(timeout.expiration.getTime() / 1000);
        const message = {
          embeds: [
            new MessageEmbed()
              .setAuthor({
                name: strings.REMINDER_TITLE,
                iconURL: icons.reminder,
              })
              .setDescription(
                strings.REMINDER_DESCRIPTION.replace('<TIME>', `<t:${unix}>`).replace(
                  '<RELATIVE_TIME>',
                  `<t:${unix}:R>`
                )
              )
              .addField(strings.SUBJECT, data.subject)
              .setColor(await getColor(user)),
          ],
          components: components(
            row(
              new MessageButton()
                .setStyle('LINK')
                .setLabel(JUMP_TO_MSG)
                .setURL(`https://discord.com/channels/${data.url}`),
              new SnoozeButton()
                .setStyle('SECONDARY')
                .setEmoji(emojis.reminder)
                .setLabel(strings.BUTTON_SNOOZE)
            )
          ),
        };

        try {
          await dest.send({
            allowedMentions: {
              users: [user.id],
            },
            content: data.destination !== 'dm' ? user.toString() : null,
            ...message,
          });
        } catch (e) {
          const dest = (await client.channels.fetch(
            data.url.split('/')[1]
          )) as GuildTextBasedChannel;

          await dest.send({
            allowedMentions: {
              users: [user.id],
            },
            content: user.toString(),
            ...message,
          });
        }
        break;
      }
    }

    await db.timeouts
      .delete({
        where: { id: timeout.id },
      })
      .catch(() => {});
  }, dayjs(timeout.expiration).diff(new Date()));

  if (loadOnly) return;
  return (await db.timeouts.create({
    data: timeout as timeouts,
  })) as FullDBTimeout<T>;
}
