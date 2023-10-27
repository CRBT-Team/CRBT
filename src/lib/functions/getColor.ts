import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { colors } from '$lib/env';
import { APIUser } from 'discord-api-types/v10';
import { Guild, User } from 'discord.js';
import {
  getGuildSettings,
  saveServerSettings,
} from '../../modules/settings/server-settings/_helpers';
import { imgDominantColor } from './imgDominantColor';
// import { imgDominantColor } from './imgDominantColor';

export async function getColor(thing: User | Guild | APIUser): Promise<number> {
  const isUser = 'username' in thing;

  if (isUser) {
    const accentColor = await fetchWithCache(`color:${thing.id}`, () =>
      prisma.user
        .findFirst({
          where: { id: thing.id },
          select: { accentColor: true },
        })
        .then((t) => t?.accentColor),
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
    const { accentColor, isAutoThemingEnabled, iconHash } = await getGuildSettings(thing.id);
    const iconUrl = thing.iconURL({ format: 'png' });

    if (isAutoThemingEnabled && iconUrl && (!accentColor || !iconHash || thing.icon !== iconHash)) {
      const dominantColor = (await imgDominantColor(iconUrl)).num();

      await saveServerSettings(thing.id, {
        iconHash: thing.icon,
        accentColor: dominantColor,
      });

      return dominantColor;
    }

    return accentColor;
  }
}
