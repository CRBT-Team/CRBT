import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { colors } from '$lib/env';
import { deepMerge } from '$lib/functions/deepMerge';
import {
  EditableGuildFeatures,
  FullGuildSettings,
  SettingFunctionProps,
  SettingsMenuProps,
} from '$lib/types/guild-settings';
// import { economySettings } from '../../../../disabled/settings/economy';
import { joinLeaveSettings } from './join-leave';
import { moderationSettings } from './moderation';
import { modlogsSettings } from './modlogs';
import { modReportsSettings } from './modreports';
import { privacySettings } from './privacy';
import { themeSettings } from './theming';

export const GuildSettingMenus = new Map<EditableGuildFeatures, SettingsMenuProps>([
  [EditableGuildFeatures.automaticTheming, themeSettings],
  [EditableGuildFeatures.joinLeave, joinLeaveSettings],
  [
    EditableGuildFeatures.joinMessage,
    { ...joinLeaveSettings, mainMenu: EditableGuildFeatures.joinLeave },
  ],
  [
    EditableGuildFeatures.leaveMessage,
    { ...joinLeaveSettings, mainMenu: EditableGuildFeatures.joinLeave },
  ],
  [EditableGuildFeatures.moderation, moderationSettings],
  [EditableGuildFeatures.moderationNotifications, modlogsSettings],
  [EditableGuildFeatures.moderationReports, modReportsSettings],
  [EditableGuildFeatures.privacy, privacySettings],
]);

export const defaultGuildSettings: FullGuildSettings = {
  accentColor: colors.default,
  flags: 0,
  isAutoThemingEnabled: true,
  modules: {
    id: null,
    economy: false,
    joinMessage: false,
    leaveMessage: false,
    moderationNotifications: false,
    moderationReports: false,
  },
  // economy: {
  //   currencyNamePlural: 'Coins',
  //   currencyNameSingular: 'Coin',
  //   currencySymbol: '🪙',
  //   items: [],
  //   categories: [],
  //   commands: {
  //     workStrings: [
  //       'You washed and properly cleaned a car, which got you {money}.',
  //       'You live streamed that hot new game online, and ads and subs make you earn {money}. GG wp.',
  //       'You washed and properly cleaned a car, which got you {money}.',
  //       'You washed and properly cleaned a car, which got you {money}.',
  //       'You washed and properly cleaned a car, which got you {money}.',
  //     ],
  //     workCooldown: 300000,
  //     workReward: '<random(100, 300)>',
  //     weeklyRewards: ['150', '150', '200', '350', '350', 'booster', '500'],
  //     dailyReward: '<random(50,150)>',
  //   },
  // },
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

export const include = {
  modules: true,
  moderationHistory: true,
  giveaways: true,
  // economy: {
  //   include: {
  //     commands: true,
  //     items: true,
  //     categories: {
  //       include: {
  //         items: true,
  //       },
  //     },
  //   },
  // },
};

export async function getGuildSettings(guildId: string, force = false) {
  const data = (await fetchWithCache(
    `${guildId}:settings`,
    () =>
      prisma.guild.findFirst({
        where: { id: guildId },
        include: include,
      }),
    force,
  )) as FullGuildSettings;

  const merged = deepMerge(defaultGuildSettings, data);
  return { ...merged, isDefault: data === null } as FullGuildSettings;
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
