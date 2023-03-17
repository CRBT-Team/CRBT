import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { colors } from '$lib/env';
import { APIUser } from 'discord-api-types/v10';
import { Guild, User } from 'discord.js';
import { getSettings, saveServerSettings } from '../../modules/settings/serverSettings/_helpers';
import { imgDominantColor } from './imgDominantColor';
// import { imgDominantColor } from './imgDominantColor';

export async function getColor(thing: User | Guild | APIUser): Promise<number> {
  const isUser = 'username' in thing;

  if (isUser) {
    const accentColor = await fetchWithCache(`${thing.id}:color`, () =>
      prisma.user
        .findFirst({
          where: { id: thing.id },
          select: { accentColor: true },
        })
        .then((t) => t?.accentColor)
    );

    if (accentColor === 0) {
      return (
        ('fetch' in thing ? (await thing.fetch()).accentColor : thing.accent_color) ??
        colors.default
      );
    } else {
      return accentColor ?? colors.default;
    }
  } else {
    const { accentColor, automaticTheming, iconHash } = await getSettings(thing.id);

    if (automaticTheming && (!accentColor || !iconHash || thing.icon !== iconHash)) {
      const guildIcon = thing.iconURL({ format: 'png' });
      const dominantColor = (await imgDominantColor(guildIcon)).num();

      await saveServerSettings(thing.id, {
        iconHash: thing.icon,
        accentColor: dominantColor,
      });

      return dominantColor;
    }

    return accentColor;
  }
}
