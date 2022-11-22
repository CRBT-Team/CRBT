import { SettingsMenus } from '$lib/types/settings';
import { components, row } from 'purplet';
import { strings } from './settings';

export const economySettings: SettingsMenus = {
  getErrors: () => [],
  getSelectMenu({ settings, feature, i }) {
    return {
      label: strings[feature],
      value: feature,
    };
  },
  getMenuDescription({}) {
    return {};
  },
  getComponents({ backBtn }) {
    return components(row(backBtn));
  },
};
