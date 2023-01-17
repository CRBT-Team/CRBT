import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { colors } from '$lib/env';
import { APIUser } from 'discord-api-types/v10';
import { Guild, User } from 'discord.js';

export async function getColor(thing: User | Guild | APIUser) {
  const isUser = 'username' in thing;

  const query = {
    where: { id: thing.id },
    select: { accentColor: true },
  };

  const accentColor = await fetchWithCache(`${thing.id}:color`, () =>
    (isUser ? prisma.user.findFirst(query) : prisma.servers.findFirst(query)).then(
      (t) => t?.accentColor
    )
  );

  if (accentColor === 0 && isUser) {
    return (
      ('fetch' in thing ? (await thing.fetch()).accentColor : thing.accent_color) ?? colors.default
    );
  }

  return accentColor ?? colors.default;
}
