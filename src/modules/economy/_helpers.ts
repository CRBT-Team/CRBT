import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { t } from '$lib/language';
import { Economy, GuildMember } from '@prisma/client';
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

export enum ItemType {
  ROLE,
  WEAPON,
  INCOME_MULTIPLIER,
  COSMETIC,
  WEBHOOK_ACTION,
  CRBTSCRIPT,
  OTHER,
}

export const itemTypes: Record<
  ItemType,
  {
    snake: string;
    hasValue: boolean;
    useType?: 'toggle' | 'once';
  }
> = {
  [ItemType.ROLE]: {
    snake: 'ROLE',
    hasValue: true,
    useType: 'toggle',
  },
  [ItemType.WEAPON]: {
    snake: 'WEAPON',
    hasValue: true,
    useType: 'toggle',
  },
  [ItemType.INCOME_MULTIPLIER]: {
    snake: 'INCOME_MULTIPLIER',
    hasValue: true,
    useType: 'once',
  },
  [ItemType.WEBHOOK_ACTION]: {
    snake: 'WEBHOOK_ACTION',
    hasValue: true,
    useType: 'once',
  },
  [ItemType.CRBTSCRIPT]: {
    snake: 'CRBTSCRIPT',
    hasValue: true,
    useType: 'once',
  },
  [ItemType.COSMETIC]: {
    snake: 'COSMETIC',
    hasValue: false,
  },
  [ItemType.OTHER]: {
    snake: 'OTHER',
    hasValue: false,
  },
};

export function formatItemType(type: ItemType, locale: string) {
  return t(locale, `ITEM_TYPE_${itemTypes[type].snake}` as any);
}

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
  },
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

export function formatItemValue(itemType: ItemType, itemValue?: string) {
  switch (itemType) {
    case ItemType.COSMETIC: {
      return 'Cosmetic item';
    }
    case ItemType.ROLE: {
      return roleMention(itemValue);
    }
    case ItemType.INCOME_MULTIPLIER: {
      return `x${itemValue}`;
    }
    default: {
      return itemValue;
    }
  }
}

export async function upsertGuildMember(
  i: Interaction,
  createArgs: Partial<GuildMember>,
  updateArgs?: Partial<
    Omit<GuildMember, 'workExp' | 'money'> & {
      workExp: {
        increment: number;
      };
      money: {
        increment: number;
      };
    }
  >,
) {
  const id = `${i.user.id}_${i.guildId}`;

  return await fetchWithCache(
    `member:${id}`,
    async () =>
      await prisma.guildMember.upsert({
        where: { id },
        create: {
          id,
          user: {
            connectOrCreate: {
              create: { id: i.user.id },
              where: { id: i.user.id },
            },
          },
          guild: {
            connect: {
              id: i.guildId,
            },
          },
          ...(createArgs as any),
        },
        update: updateArgs ?? createArgs,
        include: { items: { include: { item: true } } },
      }),
    true,
  );
}

export async function getServerMember(userId: string, guildId: string, force = false) {
  const memberId = `${userId}_${guildId}`;

  return await fetchWithCache(
    `member:${memberId}`,
    () =>
      prisma.guildMember.findFirst({
        where: { id: memberId },
        include: { items: { include: { item: true } } },
      }),
    force,
  );
}
