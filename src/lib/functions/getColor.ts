import { cache } from '$lib/cache';
import { colors, db } from '$lib/db';
import { User } from 'discord.js';

export async function getColor(user: User): Promise<`#${string}`> {
  let result: string;

  try {
    // get from the cache, if it doesn't exist, get from the db and cache that
    if (cache.has(`color_${user.id}`)) {
      result = cache.get(`color_${user.id}`);
    } else {
      const { accentColor } = await db.users.findFirst({
        where: { id: user.id },
        select: { accentColor: true },
      });
      if (accentColor) {
        result = accentColor as `#${string}`;
        cache.set(`color_${user.id}`, result);
      } else {
        result = `#${colors.default}`;
      }
    }

    if (result === 'profile') {
      result = (await user.fetch()).hexAccentColor ?? `#${colors.default}`;
      cache.set(`color_${user.id}`, result);
    }
  } catch (e) {
    result = `#${colors.default}`;
  }
  return result as `#${string}`;
}
