import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { colors } from '$lib/env';
import { Guild, User } from 'discord.js';

export async function getColor(thing: User | Guild) {
  const isUser = thing instanceof User;

  const query = {
    where: { id: thing.id },
    select: { accentColor: true },
  };

  const accentColor = await fetchWithCache(`${thing.id}:color`, () =>
    (isUser ? prisma.user.findFirst(query) : prisma.servers.findFirst(query)).then(
      (t) => t?.accentColor
    )
  );

  if (accentColor === 0 && isUser) {
    return (await thing.fetch()).accentColor ?? colors.default;
  }

  return accentColor ?? colors.default;
}
