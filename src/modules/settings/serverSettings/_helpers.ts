import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { colors } from '$lib/env';
import { icon } from '$lib/env/emojis';
import { deepMerge } from '$lib/functions/deepMerge';
import { t } from '$lib/language';
import {
  CamelCaseFeatures,
  EditableFeatures,
  FeatureSettingsProps,
  FullSettings,
  SettingsMenus,
} from '$lib/types/settings';
import { serverAnalyzeSettings } from './analyze';
// import { economySettings } from '../../../../disabled/settings/economy';
import { joinLeaveSettings } from './joinLeave';
import { modlogsSettings } from './modlogs';
import { modReportsSettings } from './modreports';
import { themeSettings } from './theming';

export const featureSettingsMenus: Record<EditableFeatures, SettingsMenus> = {
  [EditableFeatures.automaticTheming]: themeSettings,
  [EditableFeatures.joinMessage]: joinLeaveSettings,
  [EditableFeatures.leaveMessage]: joinLeaveSettings,
  [EditableFeatures.moderationLogs]: modlogsSettings,
  [EditableFeatures.moderationReports]: modReportsSettings,
  [EditableFeatures.serverAnalysis]: serverAnalyzeSettings,
  // [EditableFeatures.economy]: economySettings,
};

export const defaultSettings: FullSettings = {
  accentColor: colors.default,
  flags: 0,
  automaticTheming: true,
  modules: {
    id: null,
    economy: false,
    joinMessage: false,
    leaveMessage: false,
    moderationLogs: false,
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

export function getSettingsHeader(locale: string, accentColor: number, path: string[]) {
  return {
    author: {
      name: `CRBT - ${t(locale, 'SETTINGS_TITLE')}`,
      icon_url: icon(accentColor, 'settings', 'image'),
    },
    title: path.join(' / '),
    color: accentColor,
  };
}

export function resolveSettingsProps(
  i: FeatureSettingsProps['i'],
  feature: EditableFeatures,
  settings: FullSettings
): FeatureSettingsProps {
  const camelCasedKey = CamelCaseFeatures[feature];
  const guild = i.guild;
  const isEnabled =
    (Object.keys(settings.modules).includes(camelCasedKey)
      ? settings.modules[camelCasedKey]
      : settings[camelCasedKey]) || undefined;
  const errors =
    featureSettingsMenus[feature].getErrors?.({ feature, guild, isEnabled, settings, i }) || [];

  return {
    feature,
    settings,
    guild,
    errors,
    i,
    isEnabled,
  };
}

export const include = {
  modules: true,
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

export async function getSettings(guildId: string, force = false) {
  const data = await fetchWithCache<FullSettings>(
    `${guildId}:settings`,
    () =>
      prisma.servers.findFirst({
        where: { id: guildId },
        include,
      }),
    force
  );

  const merged = deepMerge(defaultSettings, data);
  return merged;
}

export async function saveServerSettings(guildId: string, newSettings: Partial<FullSettings>) {
  const query = (type: 'update' | 'create') =>
    Object.entries(newSettings).reduce((acc, [key, value]) => {
      if (typeof value === 'object') {
        return {
          ...acc,
          [key]:
            type === 'create'
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

  console.log(query('create'));
  console.log(query('update'));

  return fetchWithCache(
    `${guildId}:settings`,
    () =>
      prisma.servers.upsert({
        where: { id: guildId },
        create: {
          id: guildId,
          ...query('create'),
        },
        update: {
          ...query('update'),
        },
        include: include,
      }),
    true
  ) as FullSettings;
}
