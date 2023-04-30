import { links } from '$lib/env';
import emojis, { icon } from '$lib/env/emojis';
import { t } from '$lib/language';
import { UserSettingsMenusProps } from '$lib/types/user-settings';
import { components, row } from 'purplet';
import { ConfirmDataDeletion, ExportAllData } from '../privacy/manage-data';
import { ToggleSettingBtn } from '../privacy/privacy';

const privacyPreferences = [
  ['telemetry', 'TELEMETRY'],
  ['silentJoins', 'SILENT_JOINS'],
  ['silentLeaves', 'SILENT_LEAVES'],
];

export const privacySettings: UserSettingsMenusProps = {
  getMenuDescription({ accentColor, i }) {
    return {
      author: {
        name: `CRBT - ${t(i, 'PRIVACY_SETTINGS_TITLE')}`,
        icon_url: icon(accentColor, 'settings', 'image'),
      },
      description: `You can review our **[Privacy Policy on the website](${links.policy})**.`,
      fields: [
        ...privacyPreferences.map(([id, stringId]) => ({
          name: t(i, stringId as any),
          value: t(i, `PRIVACY_${stringId}_DESCRIPTION` as any),
        })),
        {
          name: t(i, 'YOUR_CRBT_DATA'),
          value: t(i, 'PRIVACY_CRBT_DATA_DESCRIPTION'),
        },
      ],
      color: accentColor,
    };
  },
  getComponents({ i, user, accentColor }) {
    return components(
      row(
        ...privacyPreferences.map(([id, stringId]) =>
          new ToggleSettingBtn({ setting: id, newState: !user[id] })
            .setLabel(t(i, stringId as any))
            .setStyle('SECONDARY')
            .setEmoji(user[id] ? icon(accentColor, 'toggleon') : emojis.toggle.off)
        )
      ),
      row(
        new ExportAllData().setStyle('PRIMARY').setLabel('Download my data'),
        new ConfirmDataDeletion().setStyle('DANGER').setLabel('Delete my data')
      )
    );
  },
  getSelectMenu: ({ user, accentColor }) => ({
    label: 'Privacy',
    description: `Telemetry turned ${user.telemetry ? 'on' : 'off'}`,
    emoji: user.telemetry ? icon(accentColor, 'toggleon') : emojis.toggle.off,
  }),
  getOverviewValue: () => ({
    value: 'undefined',
  }),
};
