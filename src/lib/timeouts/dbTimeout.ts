import { prisma } from '$lib/db';
import { Timeout, TimeoutTypes } from '$lib/types/timeouts';
import { getDiscordClient } from 'purplet';
import { ModerationAction } from '../../modules/moderation/_base';
import { setLongerTimeout } from '../functions/setLongerTimeout';
import { handleGiveaway } from './handleGiveaway';
import { handleReminder } from './handleReminder';
import { handleTempBan } from './handleTempBan';

const handle = {
  reminder: handleReminder,
  giveaway: handleGiveaway,
  [ModerationAction.UserTemporaryBan]: handleTempBan,
};

export async function dbTimeout<T extends TimeoutTypes>(
  t: T,
  timeout: Timeout[T],
  loadOnly = false,
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

      // if it's a moderationEntry, handle the type of the entry
      if ('targetId' in data) {
        handle[data.type](data, client);
      } else {
        handle[type](data, client);

        // if it's not a moderationEntry, delete the timed out element
        await prisma[type].delete({ where: { id } });
      }
    } catch (e) {}
  }, timeout.endDate.getTime() - Date.now());

  if (loadOnly) return timeout;

  return await prisma[type].create({
    data: {
      //@ts-ignore
      ...(({ guildId, userId, ...o }) => o)(timeout),
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
      ...('guildId' in timeout
        ? {
            guild: {
              connectOrCreate: {
                create: { id: timeout.guildId },
                where: { id: timeout.guildId },
              },
            },
          }
        : {}),
    },
  });
}
