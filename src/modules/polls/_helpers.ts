import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';

export async function getPollData(id: string) {
  return fetchWithCache(`poll:${id}`, () =>
    prisma.poll.findFirst({
      where: { id },
    })
  );
}
