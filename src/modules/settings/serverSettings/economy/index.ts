import { emojis, links } from '$lib/env';
import { icon } from '$lib/env/emojis';
import { slashCmd } from '$lib/functions/commandMention';
import { getEmojiObject } from '$lib/functions/getEmojiObject';
import { getEmojiURL } from '$lib/functions/getEmojiURL';
import { t } from '$lib/language';
import { SettingsMenus } from '$lib/types/settings';
import { CustomEmojiRegex } from '@purplet/utils';
import dedent from 'dedent';
import { MessageButton } from 'discord.js';
import { components, row } from 'purplet';
import { EditCurrencyButton } from './EditCurrencyButton';
import { ToggleEconomyButton } from './ToggleEconomyButton';

export const economySettings: SettingsMenus = {
  getOverviewValue: ({ settings: { economy } }) => ({
    value: `${economy.currencySymbol} ${economy.currencyNamePlural} • ${economy.items.length} items`,
  }),
  getErrors({ settings }) {
    return [];
  },
  getSelectMenu({ settings: { economy }, isEnabled }) {
    return {
      emoji: isEnabled ? economy.currencySymbol : emojis.toggle.off,
      description: economy.currencyNamePlural,
    };
  },
  getMenuDescription({ settings: { economy, accentColor }, isEnabled, i }) {
    return {
      description: dedent`
      **⚠️ Economy is currently in alpha. If you're seeing this, you've got early access!**
      Have feedback? Got bugs? Join the **[CRBT Community](${links.discord})** or use ${slashCmd(
        'report'
      )}!`,
      fields: [
        {
          name: t(i, 'STATUS'),
          value: isEnabled
            ? `${icon(accentColor, 'toggleon')} ${t(i, 'ENABLED')}`
            : `${emojis.toggle.off} ${t(i, 'ENABLED')}`,
        },
        {
          name: 'Currency',
          value: dedent`${economy.currencySymbol} \`${
            economy.currencySymbol.match(CustomEmojiRegex)
              ? `:${getEmojiObject(economy.currencySymbol).name}:`
              : economy.currencySymbol
          }\`
          ${economy.currencyNameSingular} (${economy.currencyNamePlural})`,
          inline: true,
        },
        {
          name: 'Income commands',
          value: dedent`
          ${slashCmd('work')} • \`${economy.commands.workCooldown / 100 / 60}m\` cooldown
          ${slashCmd('daily')} • \`${economy.commands.dailyReward}\``,
          inline: true,
        },
        {
          name: `Shop`,
          value: !economy.categories.length
            ? dedent`This server's Shop is empty! Click "Edit Shop" to set up your Shop!`
            : economy.categories
                .map((c) => `${c.emoji} **${c.label}** • ${c.items.length} items`)
                .join('\n'),
        },
        {
          name: 'Transaction logs channel',
          value: dedent`
            Set up a channel where ${
              economy.currencyNameSingular
            } transfers and item purchases are logged.
            
            ${
              economy.transactionLogsChannel
                ? `**Set to <#${economy.transactionLogsChannel}>**`
                : 'Set one using the "Edit Channel" button below.'
            }
            `,
        },
      ],
      thumbnail: {
        url: getEmojiURL(economy.currencySymbol),
      },
    };
  },
  getComponents({ backBtn, isEnabled, i }) {
    return components(
      row(
        backBtn,
        new ToggleEconomyButton(isEnabled as never)
          .setLabel(t(i, isEnabled ? 'DISABLE_FEATURE' : 'ENABLE_FEATURE'))
          .setStyle(isEnabled ? 'DANGER' : 'SUCCESS')
      ),
      row(
        new EditCurrencyButton()
          .setEmoji(emojis.buttons.pencil)
          .setStyle('PRIMARY')
          .setLabel('Edit Currency'),
        new MessageButton()
          .setCustomId('h')
          .setEmoji(emojis.buttons.pencil)
          .setStyle('PRIMARY')
          .setDisabled()
          .setLabel('Edit Shop')
        // new EditEconomyLogsBtn()
        //   .setEmoji(emojis.buttons.pencil)
        //   .setStyle('PRIMARY')
        //   .setLabel('Edit Logs Channel')
      )
    );
  },
};
