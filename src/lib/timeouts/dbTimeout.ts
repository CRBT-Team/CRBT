import { db } from '$lib/db';
import { TimeoutData, TimeoutTypes } from '$lib/types/timeouts';
import { randomUUID } from 'crypto';
import { getDiscordClient } from 'purplet';
import { setLongerTimeout } from '../functions/setLongerTimeout';
import { handleGiveaway } from './handleGiveaway';
import { handlePoll } from './handlePoll';
import { handleReminder } from './handleReminder';
import { handleTempBan } from './handleTempBan';

export async function dbTimeout<T extends TimeoutData>(
  timeout: T,
  loadOnly: boolean = false
): Promise<T> {
  const client = getDiscordClient();

  timeout.id = timeout.id ?? randomUUID();

  setLongerTimeout(async () => {
    const timeoutData = (await db.timeouts.findFirst({
      where: { id: timeout.id },
    })) as TimeoutData;

    if (!timeoutData) return;

    if (timeoutData.type === TimeoutTypes.TempBan) {
      handleTempBan(timeoutData, client);
    }

    if (timeoutData.type === TimeoutTypes.Poll) {
      handlePoll(timeoutData, client);
    }

    if (timeoutData.type === TimeoutTypes.Giveaway) {
      handleGiveaway(timeoutData, client);
    }

    if (timeoutData.type === TimeoutTypes.Reminder) {
      handleReminder(timeoutData, client);
    }

    await db.timeouts
      .delete({
        where: { id: timeout.id },
      })
      .catch(() => {});
  }, timeout.expiration.getTime() - Date.now());

  if (loadOnly) return;

  return (await db.timeouts.create({
    data: timeout,
  })) as T;
}
