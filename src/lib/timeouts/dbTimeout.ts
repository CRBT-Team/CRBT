import { prisma } from '$lib/db';
import { Timeout } from '$lib/types/timeouts';
import { TimeoutTypes } from '@prisma/client';
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
  const type = timeout.type.toString() as TimeoutTypes;
  const rawTimeout = (({ type, ...o }) => o)(timeout) as Omit<Timeout, 'type'>;

  setLongerTimeout(async () => {
    if (!timeout) return;

    try {
      const data = await prisma[type].findFirst({
        where: { id },
      });

      handle[type](data, client);
    } catch (e) {}

    await prisma[type].delete({ where: { id } });
  }, rawTimeout.expiresAt.getTime() - Date.now());

  if (loadOnly) return timeout;

  return (await prisma[type].create({
    data: rawTimeout,
  })) as T;
}
