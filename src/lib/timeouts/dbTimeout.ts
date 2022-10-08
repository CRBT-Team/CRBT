import { prisma } from '$lib/db';
import { Timeout, TimeoutTypes } from '$lib/types/timeouts';
import { randomUUID } from 'crypto';
import { getDiscordClient } from 'purplet';
import { setLongerTimeout } from '../functions/setLongerTimeout';
import { handleGiveaway } from './handleGiveaway';
import { handlePoll } from './handlePoll';
import { handleReminder } from './handleReminder';

const handle = {
  poll: handlePoll,
  reminder: handleReminder,
  giveaway: handleGiveaway,
}

export async function dbTimeout<T extends Timeout>(
  timeout: T,
  type: TimeoutTypes,
  loadOnly: boolean = false
): Promise<T> {
  const client = getDiscordClient();
  const { id } = timeout;

  setLongerTimeout(async () => {
    if (!timeout) return;

    const data = (await prisma[type.toString()].findFirst({
      where: { id },
    }));

    handle[type](data, client);

    await prisma[type.toString()].delete({ where: { id } });

  }, timeout.expiresAt.getTime() - Date.now());

  if (loadOnly) return timeout;

  return (await prisma[type.toString()].create({
    data: timeout,
  })) as T;
}
