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

export async function dbTimeout<T extends TimeoutTypes>(
  t: T,
  timeout: Timeout[T],
  loadOnly = false
): Promise<Timeout[T]> {
  const client = getDiscordClient();
  const { id } = timeout;
  const type = t as string;

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

  return await prisma[type].create({
    data: {
      //@ts-ignore
      ...(({ serverId, userId, ...o }) => o)(timeout),
      ...('userId' in timeout
        ? {
            user: {
              connectOrCreate: {
                create: { id: timeout.userId },
                where: { id: timeout.userId },
              },
            },
          }
        : {}),
      ...('serverId' in timeout
        ? {
            server: {
              connectOrCreate: {
                create: { id: timeout.serverId },
                where: { id: timeout.serverId },
              },
            },
          }
        : {}),
    },
  });
}
