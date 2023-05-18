import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { colors } from '$lib/env';
import { deepMerge } from '$lib/functions/deepMerge';
import { getColor } from '$lib/functions/getColor';
import {
  FullUser,
  UserSettingsMenus,
  UserSettingsMenusFunctionProps,
  UserSettingsMenusProps,
} from '$lib/types/user-settings';
import { privacySettings } from './privacy';

export const userSettingsMenus: Record<UserSettingsMenus, UserSettingsMenusProps> = {
  // [UserSettingsMenus.accentColor]: accentColorSettings,
  [UserSettingsMenus.privacy]: privacySettings,
};

export const defaultUserSettings: FullUser = {
  accentColor: colors.default,
  crbtBadges: [],
  silentJoins: false,
  silentLeaves: false,
  telemetry: true,
};

export async function resolveUserSettingsProps(
  i: UserSettingsMenusFunctionProps['i'],
  menu: UserSettingsMenus,
  user: FullUser
): Promise<UserSettingsMenusFunctionProps> {
  const accentColor = await getColor({
    username: '',
    avatar: '',
    id: user.id,
    discriminator: '',
    global_name: '',
    display_name: '',
    avatar_decoration: '',
  });
  const errors = userSettingsMenus[menu].getErrors?.({ accentColor, menu, user, i }) || [];

  return {
    menu,
    user,
    accentColor,
    errors,
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
