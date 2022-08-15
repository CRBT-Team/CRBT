import { cache } from '$lib/cache';
import { colors, db } from '$lib/db';
import { Guild, User } from 'discord.js';

type colorString = `#${string}`;

export async function getColor(thing: User | Guild): Promise<colorString> {
  const isUser = thing instanceof User;

  if (cache.has(`${thing.id}:color`)) {
    return cache.get<colorString>(`${thing.id}:color`);
  }

  const query = {
    where: { id: thing.id },
    select: { accentColor: true },
  };

  const accentColor = (isUser ? await db.users.findFirst(query) : await db.servers.findFirst(query))
    .accentColor;

  if (accentColor === 'profile' && isUser) {
    cache.set(`${thing.id}:color`, accentColor);
    return (await thing.fetch()).hexAccentColor ?? `#${colors.default}`;
  }

  if (accentColor) {
    cache.set(`${thing.id}:color`, accentColor);
    return accentColor as colorString;
  }

  cache.set(`${thing.id}:color`, `#${colors.default}`);
  return `#${colors.default}`;
}
