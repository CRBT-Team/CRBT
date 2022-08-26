import { cache } from '$lib/cache';
import { colors, db } from '$lib/db';
import { Guild, User } from 'discord.js';

type colorString = `#${string}`;

export async function getColor(thing: User | Guild): Promise<colorString> {
  const isUser = thing instanceof User;
  const fromCache = cache.get(`${thing.id}:color`);

  console.log(fromCache);

  if (fromCache) {
    if (fromCache === 'profile' && isUser) {
      return (await thing.fetch()).hexAccentColor ?? `#${colors.default}`;
    }
    return fromCache as colorString;
  }

  const query = {
    where: { id: thing.id },
    select: { accentColor: true },
  };

  const preferences = isUser ? await db.users.findFirst(query) : await db.servers.findFirst(query);

  if (preferences && preferences.accentColor) {
    const color = preferences.accentColor;
    cache.set(`${thing.id}:color`, color);

    if (color === 'profile' && isUser) {
      return (await thing.fetch()).hexAccentColor ?? `#${colors.default}`;
    }

    return color as colorString;
  }

  cache.set(`${thing.id}:color`, `#${colors.default}`);
  return `#${colors.default}`;
}
