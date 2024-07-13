import { emojis, links } from '$lib/env';
import { slashCmd } from '$lib/functions/commandMention';
import { getEmojiObject } from '$lib/functions/getEmojiObject';
import { getEmojiURL } from '$lib/functions/getEmojiURL';
import { t } from '$lib/language';
import { SettingsMenuProps } from '$lib/types/guild-settings';
import { CustomEmojiRegex } from '@purplet/utils';
import dedent from 'dedent';
import { components, row } from 'purplet';
import { EditCategoriesButton } from './EditCategoriesButton';
import { EditCurrencyButton } from './EditCurrencyButton';
import { ToggleEconomyButton } from './ToggleEconomyButton';

export interface ItemEditProps {
  id?: string | null;
  mode: 'setup' | 'edit';
  cId?: string;
}

export const economySettings: SettingsMenuProps = {
  newLabel: true,
  description: (l) => t(l, 'SETTINGS_ECONOMY_SHORT_DESCRIPTION'),
  getErrors({ settings }) {
    return [];
  },
  renderMenuMessage({ settings: { economy, modules }, i, backBtn }) {
    return {
      embeds: [
        {
          description: dedent`
        **⚠️ Economy is currently in alpha. If you're seeing this, you've got early access!**
        Have feedback, bugs? Use ${slashCmd('report')}!`,
          fields: [
            {
              name: t(i, 'STATUS'),
              value: modules.economy
                ? `${emojis.toggle.on} ${t(i, 'ENABLED')}`
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
            ${slashCmd('work')} • \`${economy.workCooldown / 100 / 60}m\` cooldown
            ${slashCmd('daily')} • \`${economy.dailyReward}\``,
              inline: true,
            },
            {
              name: `Shop`,
              value: !economy.categories.length
                ? dedent`This server's Shop is empty! Click "Edit Shop" to set up your Shop!`
                : economy.categories
                    .map((c) => `${c.emoji} **${c.label}** • ${c.items.length} item(s)`)
                    .join('\n'),
            },
            {
              name: 'Transaction logs channel',
              value: dedent`
              Set up a channel where ${
                economy.currencyNameSingular
              } transfers and item purchases are logged.
              
              ${
                economy.transactionLogsChannelId
                  ? `**Set to <#${economy.transactionLogsChannelId}>**`
                  : 'Set one using the "Edit Channel" button below.'
              }
              `,
            },
          ],
          thumbnail: {
            url: getEmojiURL(economy.currencySymbol),
          },
        },
      ],
      components: components(
        row(
          backBtn,
          new ToggleEconomyButton(modules.economy as never)
            .setLabel(t(i, modules.economy ? 'DISABLE_FEATURE' : 'ENABLE_FEATURE'))
            .setStyle(modules.economy ? 'DANGER' : 'SUCCESS'),
        ),
        row(
          new EditCurrencyButton()
            .setEmoji(emojis.buttons.edit)
            .setStyle('PRIMARY')
            .setLabel('Edit Currency'),
          new EditCategoriesButton()
            .setEmoji(emojis.buttons.edit)
            .setStyle('PRIMARY')
            .setLabel('Edit Shop'),
          // new EditEconomyLogsBtn()
          //   .setEmoji(emojis.buttons.pencil)
          //   .setStyle('PRIMARY')
          //   .setLabel('Edit Logs Channel')
        ),
      ),
    };
  },
};
