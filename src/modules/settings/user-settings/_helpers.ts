import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { colors } from '$lib/env';
import { deepMerge } from '$lib/functions/deepMerge';
import {
  EditableUserSettings,
  FullUser,
  UserSettingFunctionProps,
  UserSettingsMenusProps,
} from '$lib/types/user-settings';
import { userAccentColorSettings } from './accent-color';
import { privacySettings } from './privacy';

export const UserSettingsMenus = new Map<EditableUserSettings, UserSettingsMenusProps>([
  [EditableUserSettings.accentColor, userAccentColorSettings],
  [EditableUserSettings.privacy, privacySettings],
]);

export const defaultUserSettings: FullUser = {
  accentColor: colors.default,
  crbtBadges: [],
  silentJoins: false,
  silentLeaves: false,
  hasTelemetryEnabled: true,
};

export function resolveUserSettingsProps(
  i: UserSettingFunctionProps['i'],
  menu: UserSettingsMenusProps,
  user: FullUser,
  accentColor: number
): UserSettingFunctionProps {
  return {
    user,
    accentColor,
    errors: menu.getErrors?.({ user, i, accentColor }) || [],
    i,
  };
}

export async function getUser(userId: string, force = false) {
  const data = await fetchWithCache<FullUser>(
    `user:${userId}`,
    () =>
      prisma.user.findFirst({
        where: { id: userId },
      }),
    force
  );

  const merged = deepMerge(defaultUserSettings, data);
  return merged;
}
