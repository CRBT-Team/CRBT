import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { colors, icons } from '$lib/env';
import { deepMerge } from '$lib/functions/deepMerge';
import {
  EditableGuildFeatures,
  FullGuildSettings,
  SettingFunctionProps,
  SettingsMenuProps,
} from '$lib/types/guild-settings';
import { Guild, MessageEmbedOptions } from 'discord.js';
import { economySettings } from './economy/MenuOverview';
import { joinLeaveSettings } from './join-leave';
import { moderationSettings } from './moderation/moderation';
import { modlogsSettings } from './moderation/logs';
import { modReportsSettings } from './moderation/reports';
import { privacySettings } from './privacy';
import { themeSettings } from './theming';
import { t } from '$lib/language';
import { PrismaClient } from '@prisma/client';

export const GuildSettingMenus = new Map<EditableGuildFeatures, SettingsMenuProps>([
  [EditableGuildFeatures.automaticTheming, themeSettings],
  [EditableGuildFeatures.joinLeave, joinLeaveSettings],
  [EditableGuildFeatures.joinMessage, { ...joinLeaveSettings, mainMenu: 'overview' }],
  [EditableGuildFeatures.leaveMessage, { ...joinLeaveSettings, mainMenu: 'overview' }],
  [EditableGuildFeatures.economy, economySettings],
  [EditableGuildFeatures.moderation, moderationSettings],
  [EditableGuildFeatures.moderationNotifications, modlogsSettings],
  [EditableGuildFeatures.moderationReports, modReportsSettings],
  [EditableGuildFeatures.privacy, privacySettings],
]);

export const defaultGuildSettings: FullGuildSettings = {
  accentColor: colors.default,
  flags: 0,
  isAutoThemingEnabled: true,
  joinChannelId: null,
  joinMessage: null,
  leaveChannelId: null,
  leaveMessage: null,
  modLogsChannelId: null,
  modReportsChannelId: null,
  giveaways: [],
  moderationHistory: [],
  modules: {
    economy: false,
    joinMessage: false,
    leaveMessage: false,
    moderationNotifications: false,
    moderationReports: false,
  },
  economy: {
    currencyNamePlural: 'Coins',
    currencyNameSingular: 'Coin',
    currencySymbol: '🪙',
    items: [],
    categories: [],
    workStrings: [
      'You washed and properly cleaned a car, which got you {money}.',
      'You live streamed that hot new game online, and ads and subs make you earn {money}. GG wp.',
      'You washed and properly cleaned a car, which got you {money}.',
      'You washed and properly cleaned a car, which got you {money}.',
      'You washed and properly cleaned a car, which got you {money}.',
    ],
    workCooldown: 300000,
    workReward: '<random(100, 300)>',
    weeklyRewards: ['150', '150', '200', '350', '350', 'booster', '500'],
    dailyReward: '<random(50,150)>',
  },
};

export function resolveSettingsProps(
  i: SettingFunctionProps['i'],
  menu: SettingsMenuProps,
  settings: FullGuildSettings,
): SettingFunctionProps {
  return {
    guild: i.guild,
    errors: menu.getErrors?.({ guild: i.guild, i, settings }) || [],
    settings,
    i,
  };
}

export const include: Parameters<PrismaClient['guild']['findFirst']>['0']['include'] = {
  modules: true,
  moderationHistory: true,
  giveaways: true,
  economy: {
    include: {
      items: true,
      categories: {
        include: {
          items: true,
        },
      },
    },
  },
};

export async function getGuildSettings(guildId: string, force = false) {
  const data = await fetchWithCache<FullGuildSettings>(
    `${guildId}:settings`,
    () =>
      prisma.guild.findFirst({
        where: { id: guildId },
        include: include,
      }) as any,
    force,
  );

  const merged = deepMerge(defaultGuildSettings, data);
  return merged as FullGuildSettings;
}

export async function saveServerSettings(guildId: string, newSettings: Partial<FullGuildSettings>) {
  function isTopLevel(key: string | keyof FullGuildSettings) {
    return !Object.keys(include).includes(key);
  }

  const query = (type: 'update' | 'create') =>
    Object.entries(newSettings).reduce((acc, [key, value]) => {
      if (typeof value === 'object') {
        return {
          ...acc,
          [key]: isTopLevel(key)
            ? value
            : type === 'create'
              ? {
                  connectOrCreate: {
                    where: { id: guildId },
                    create: value,
                  },
                }
              : {
                  upsert: {
                    create: value,
                    update: value,
                  },
                },
        };
      }

      return {
        ...acc,
        [key]: value,
      };
    }, {});

  const fullQuery = {
    where: { id: guildId },
    create: {
      id: guildId,
      ...query('create'),
    },
    update: {
      ...query('update'),
    },
    include: include,
  };

  return fetchWithCache(
    `${guildId}:settings`,
    () =>
      prisma.guild.upsert({
        ...fullQuery,
      }),
    true,
  ) as FullGuildSettings;
}

export function getGuildSettingsHeader(
  guild: Guild,
  settings: FullGuildSettings,
  locale: string,
  ...options: string[]
): MessageEmbedOptions {
  return {
    author: {
      name:
        options.length > 1
          ? `${t(locale, 'SETTINGS_TITLE')} - ${options.slice(0, -1).join(' - ')}`
          : `${guild.name} - ${t(locale, 'SETTINGS_TITLE')}`,
      iconURL: icons.settings,
    },
    title: options[options.length - 1],
    color: settings.accentColor,
  };
}

export function isDefaultGuildSettings(settings: FullGuildSettings) {
  // Do a parse/stringify to remove any "undefined"s, etc.
  const parsedSettings = JSON.parse(JSON.stringify(settings));

  const {
    id,
    iconHash,
    flags,
    modules: { id: mId, ...restModules },
    ...rest
  } = parsedSettings;

  let isDefault = true;

  // Check every key
  for (const key in rest) {
    if (JSON.stringify(rest[key]) !== JSON.stringify(defaultGuildSettings[key])) {
      isDefault = false;
      break;
    }
  }
  // Check every key in modules
  for (const key in restModules) {
    if (JSON.stringify(restModules[key]) !== JSON.stringify(defaultGuildSettings.modules[key])) {
      isDefault = false;
      break;
    }
  }

  return isDefault;
}
