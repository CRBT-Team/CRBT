import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { CustomEmojiRegex } from '@purplet/utils';

export async function getPollData(channelId: string, messageId: string) {
  return fetchWithCache(`poll:${channelId}/${messageId}`, () =>
    prisma.poll
      .findFirst({
        where: {
          messageId,
          channelId,
        },
      })
      .catch((e) =>
        prisma.poll.findFirst({
          where: {
            id: messageId,
          },
        }),
      ),
  );
}

export function parseOptionName(label: string) {
  return label.replace(CustomEmojiRegex, '').split(' • ').slice(0, -1).join(' • ');
}
