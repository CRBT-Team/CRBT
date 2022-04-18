import { cache } from '$lib/cache';
import { colors, db } from '$lib/db';
import { User } from 'discord.js';

export async function getColor(user: User): Promise<`#${string}`> {
  let result: string;

  // get from the cache, if it doesn't exist, get from the db and cache that
  if (cache.has(`color_${user.id}`)) {
    result = cache.get(`color_${user.id}`);
  } else {
    const profile = await db.profiles.findFirst({
      where: { id: user.id },
    });
    if (profile) {
      result = profile.crbt_accent_color as `#${string}`;
      cache.set(`color_${user.id}`, result);
    } else {
      result = `#${colors.default}`;
    }
  }

  if (result === 'profile') {
    result = (await user.fetch()).hexAccentColor ?? `#${colors.default}`;
    cache.set(`color_${user.id}`, result);
  }

  return result as `#${string}`;
}
