import { User } from 'discord.js';
import { getVar } from './getVar';

export async function getColor(user: User): Promise<`#${string}`> {
  const color = await getVar('color', user.id);
  return color === 'profile' ? (await user.fetch()).hexAccentColor : `#${color}`;
}
