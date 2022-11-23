import { emojis, links } from '$lib/env';
import { slashCmd } from '$lib/functions/commandMention';
import { getEmojiURL } from '$lib/functions/getEmojiURL';
import { SettingsMenus } from '$lib/types/settings';
import dedent from 'dedent';
import { components, row } from 'purplet';

export const economySettings: SettingsMenus = {
  getErrors({ settings }) {
    return [];
  },
  getSelectMenu({ settings, isEnabled }) {
    return {
      emoji: isEnabled ? settings.economy.currencySymbol : emojis.toggle.off,
      description: settings.economy.currencyNamePlural,
    };
  },
  getMenuDescription({ settings, isEnabled }) {
    return {
      description: dedent`
      **⚠️ Economy is in alpha that's being experimented with. If you're seeing this, you've got early access!**
      Have feedback? Got bugs? Join the **[CRBT Community](${links.discord})** or use ${slashCmd(
        'report'
      )}!`,
      fields: [
        {
          name: 'Status',
          value: isEnabled ? `${emojis.toggle.on} Enabled` : `${emojis.toggle.off} Disabled`,
        },
        {
          name: 'Currency',
          value: `${settings.economy.currencySymbol} ${settings.economy.currencyNameSingular} (${settings.economy.currencyNamePlural})`,
          inline: true,
        },
        // {
        //   name: 'Commands',
        //   value:
        // }
      ],
      thumbnail: {
        url: getEmojiURL(settings.economy.currencySymbol),
      },
    };
  },
  getComponents({ backBtn, toggleBtn }) {
    return components(row(backBtn, toggleBtn));
  },
};
