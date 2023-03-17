import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { CustomEmojiRegex } from '@purplet/utils';

export async function getPollData(id: string) {
  return fetchWithCache(`poll:${id}`, () =>
    prisma.poll.findFirst({
      where: { id },
    })
  );
}

export function parseOptionName(label: string) {
  return label.replace(CustomEmojiRegex, '').split(' • ').slice(0, -1).join(' • ');
}
