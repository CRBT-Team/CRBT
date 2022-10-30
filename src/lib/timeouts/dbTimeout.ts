import { prisma } from '$lib/db';
import { Timeout, TimeoutTypes } from '$lib/types/timeouts';
import { getDiscordClient } from 'purplet';
import { setLongerTimeout } from '../functions/setLongerTimeout';
import { handleGiveaway } from './handleGiveaway';
import { handlePoll } from './handlePoll';
import { handleReminder } from './handleReminder';

const handle = {
  poll: handlePoll,
  reminder: handleReminder,
  giveaway: handleGiveaway,
};

export async function dbTimeout<T extends Timeout>(
  timeout: T,
  loadOnly: boolean = false
): Promise<T> {
  const client = getDiscordClient();
  const { id } = timeout;
  const type = timeout.type.toString();

  setLongerTimeout(async () => {
    if (!timeout) return;

    try {
      const data = await prisma[type].findFirst({
        where: { id },
      });

      handle[type](data, client);
    } catch (e) {}

    await prisma[type].delete({ where: { id } });
  }, timeout.expiresAt.getTime() - Date.now());

  if (loadOnly) return timeout;

  let query: {};

  switch (timeout.type) {
    case TimeoutTypes.Giveaway:
    case TimeoutTypes.Poll: {
      query = {
        ...(({ type, serverId, ...o }) => o)(timeout),
        server: {
          connectOrCreate: {
            create: { id: timeout.serverId },
            where: { id: timeout.serverId },
          },
        },
      };
      break;
    }
    case TimeoutTypes.Reminder: {
      query = {
        ...(({ type, userId, ...o }) => o)(timeout),
        user: {
          connectOrCreate: {
            create: { id: timeout.userId },
            where: { id: timeout.userId },
          },
        },
      };
      break;
    }
  }

  return (await prisma[type].create({
    data: query,
  })) as T;
}
