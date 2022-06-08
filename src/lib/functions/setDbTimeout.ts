import { db } from '$lib/db';
import { timeouts, TimeoutTypes } from '@prisma/client';
import dayjs from 'dayjs';
import { TextChannel } from 'discord.js';
import { getDiscordClient } from 'purplet';
import { endPoll } from '../../modules/polls/poll';
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
}

export type FullDBTimeout<T extends TimeoutTypes> = Omit<timeouts, 'id' | 'data'> & {
  id?: string | undefined;
  type: T;
  data: TimeoutData[T];
};

export type RawDBTimeout = Omit<timeouts, 'id' | 'data'> & {
  id?: string | undefined;
  // so that typescript doesnt get mad
  data: any;
};

export async function setDbTimeout<T extends TimeoutTypes>(
  timeout: FullDBTimeout<T> | RawDBTimeout,
  loadOnly: boolean = false
): Promise<FullDBTimeout<T>> {
  const client = getDiscordClient();

  setLongerTimeout(async () => {
    const timeoutData = (await db.timeouts.findFirst({
      where: { id: timeout.id },
    })) as FullDBTimeout<T>;
    if (!timeoutData) return;

    switch (timeout.type) {
      case 'TEMPBAN': {
        const { data } = timeoutData as FullDBTimeout<'TEMPBAN'>;
        const guild = client.guilds.cache.get(data.userId);
        await guild.members.unban(data.userId, data.reason);
      }
      case 'POLL': {
        const { data } = timeoutData as FullDBTimeout<'POLL'>;
        const [channelId, messageId] = timeoutData.id.split('/');
        const channel = client.channels.cache.get(channelId) as TextChannel;
        const msg = channel ? await channel.messages.fetch(messageId).catch(() => null) : undefined;
        if (!msg) return;

        endPoll(data, msg, timeoutData.locale);
      }
    }

    await db.timeouts.delete({
      where: { id: timeout.id },
    });
  }, dayjs(timeout.expiration).diff(new Date()));

  if (loadOnly) return;
  return (await db.timeouts.create({
    data: timeout,
  })) as FullDBTimeout<T>;
}
