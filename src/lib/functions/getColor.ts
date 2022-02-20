import { cache } from '$lib/cache';
import { colors, db } from '$lib/db';
import { User } from 'discord.js';

export async function getColor(user: User): Promise<`#${string}`> {
  const fromCache = cache.get<string>(`color_${user.id}`);

  if (fromCache) {
    return `#${fromCache}`;
  }
  const req = (await db.profiles.findFirst({
    where: {
      id: {
        equals: user.id,
      },
    },
    select: {
      crbt_accent_color: true,
    },
  })).crbt_accent_color;

  const color = req ?? `#${colors.default}`;

  return (color === 'profile' ? (await user.fetch()).hexAccentColor : color) as `#${string}`;
}
