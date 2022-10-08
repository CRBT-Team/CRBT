import { cache } from '$lib/cache';
import { prisma } from '$lib/db';
import { colors } from '$lib/env';
import { Guild, User } from 'discord.js';

export async function getColor(thing: User | Guild) {
  const isUser = thing instanceof User;
  const fromCache = cache.get<number | 'profile'>(`${thing.id}:color`);

  console.log(fromCache);

  if (fromCache) {
    if (fromCache === 'profile' && isUser) {
      return (await thing.fetch()).accentColor ?? colors.default;
    }
    return fromCache as number;
  }

  const query = {
    where: { id: thing.id },
    select: { accentColor: true },
  };

  const preferences = isUser ? await prisma.user.findFirst(query) : await prisma.servers.findFirst(query);

  if (preferences && preferences.accentColor) {
    const color = preferences.accentColor;
    cache.set(`${thing.id}:color`, color);

    if (color === 0 && isUser) {
      return (await thing.fetch()).accentColor ?? colors.default;
    }

    return typeof color === 'string' ? parseInt(color, 16) : color;
  }

  cache.set(`${thing.id}:color`, colors.default);
  return colors.default;
}
