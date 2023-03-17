import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { Economy, ItemTypes, ServerMember } from '@prisma/client';
import { roleMention } from '@purplet/utils';
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { CommandInteraction, Interaction } from 'discord.js';
import { balance } from './balance';
import { daily } from './daily';
import { give } from './give';
import { inventory } from './inventory/inventory';
import { leaderboard } from './leaderboard';
import { shop } from './shop/shop';
import { work } from './work';

export const economyCommands = {
  balance: balance,
  daily: daily,
  give: give,
  leaderboard: leaderboard,
  work: work,
  shop: shop,
  inventory: inventory,
};

interface EconomyCommandMetaProps {
  singular: string;
  plural: string;
}

export interface EconomyCommand {
  getMeta({ singular, plural }: EconomyCommandMetaProps): RESTPostAPIApplicationCommandsJSONBody;
  handle(this: CommandInteraction): Promise<any>;
}

export function currencyFormat(
  amount: { money: number } | number,
  economy: Partial<Economy>,
  locale: string,
  options?: {
    zeroEqualsFree?: boolean;
    withoutSymbol?: boolean;
  }
) {
  options ??= {};
  options.zeroEqualsFree ??= true;
  options.withoutSymbol ??= false;
  amount = typeof amount === 'object' ? amount.money : amount;

  const formattedString =
    options.zeroEqualsFree && amount === 0
      ? 'Free'
      : `${amount.toLocaleString(locale)} ${
          amount === 1 ? economy.currencyNameSingular : economy.currencyNamePlural
        }`;

  return options.withoutSymbol ? formattedString : `${economy.currencySymbol} ${formattedString}`;
}

export function formatItemValue(itemType: ItemTypes, itemValue?: string) {
  switch (itemType) {
    case ItemTypes.COSMETIC: {
      return itemValue;
    }
    case ItemTypes.ROLE: {
      return roleMention(itemValue);
    }
    case ItemTypes.INCOME_MULTIPLIER: {
      return `x${itemValue}`;
    }
    default: {
      return itemValue;
    }
  }
}

export async function upsertServerMember(
  i: Interaction,
  createArgs: Partial<ServerMember>,
  updateArgs?: Partial<
    Omit<ServerMember, 'workExp' | 'money'> & {
      workExp: {
        increment: number;
      };
      money: {
        increment: number;
      };
    }
  >
) {
  const id = `${i.user.id}_${i.guildId}`;

  return await prisma.serverMember.upsert({
    where: { id },
    create: {
      id,
      user: {
        connectOrCreate: {
          create: { id: i.user.id },
          where: { id: i.user.id },
        },
      },
      server: {
        connectOrCreate: {
          create: { id: i.guildId },
          where: { id: i.guildId },
        },
      },
      ...(createArgs as any),
    },
    update: updateArgs ?? createArgs,
  });
}

export async function getServerMember(userId: string, guildId: string, force = false) {
  const memberId = `${userId}_${guildId}`;

  return await fetchWithCache(
    `member:${memberId}`,
    () =>
      prisma.serverMember.findFirst({
        where: { id: memberId },
        include: { items: true, activeItems: true },
      }),
    force
  );
}
