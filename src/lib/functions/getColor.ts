import { cache } from '$lib/cache';
import { colors, db } from '$lib/db';
import { User } from 'discord.js';

export async function getColor(user: User): Promise<`#${string}`> {
  let result: string;

  if (cache.has(`color_${user.id}`)) {
    result = cache.get<string>(`color_${user.id}`);
  } else {
    const req = await db.profiles.findFirst({
      where: { id: user.id },
      select: { crbt_accent_color: true },
    });

    result = req && req.crbt_accent_color ? req.crbt_accent_color : `#${colors.default}`;
    cache.set(`color_${user.id}`, result);
  }

  result = result === 'profile' ? (await user.fetch()).hexAccentColor : result;

  return result as `#${string}`;
}
