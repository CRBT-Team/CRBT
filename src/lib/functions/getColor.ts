import { colors, db } from '$lib/db';
import { APIProfile } from '$lib/types/CRBT/APIProfile';
import { User } from 'discord.js';

export async function getColor(user: User): Promise<`#${string}`> {
  const req =
    // const { crbt_accent_color: color } = (
    (await db.from<APIProfile>('profiles').select('*').eq('id', user.id)).body;

  const color = req.length !== 0 ? req[0].crbt_accent_color : `#${colors.default}`;

  return (color === 'profile' ? (await user.fetch()).hexAccentColor : color) as `#${string}`;
}
