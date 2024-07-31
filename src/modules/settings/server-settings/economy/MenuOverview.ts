import { emojis } from '$lib/env';
import { slashCmd } from '$lib/functions/commandMention';
import { getEmojiURL } from '$lib/functions/getEmojiURL';
import { t } from '$lib/language';
import { SettingsMenuProps } from '$lib/types/guild-settings';
import dedent from 'dedent';
import { components, row } from 'purplet';
import { EditCurrencyButton } from './EditCurrencyButton';
import { ToggleEconomyButton } from './CommandsButtons';
import { economyNavBar } from './_navbar';

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
          title: `${t(i, 'ECONOMY')} - ${t(i, 'OVERVIEW')}`,
          description: modules.economy
            ? `${emojis.toggle.on} ${t(i, 'ENABLED')}`
            : `${emojis.toggle.off} ${t(i, 'ENABLED')}`,
          fields: [
            {
              name: 'Currency',
              value: `${economy.currencySymbol} ${economy.currencyNamePlural}`,
              inline: true,
            },
            {
              name: 'Income commands',
              value: `${slashCmd('work')} • ${slashCmd('daily')}`,
              inline: true,
            },
            {
              name: `Shop`,
              value: !economy.categories.length
                ? dedent`The server's Shop is empty! Go to the Shop section to set it up!`
                : `${economy.categories.length} ${economy.categories.length === 1 ? 'category' : 'categories'} • ${economy.items.length} item(s)`,
            },
            {
              name: 'Transaction logs channel',
              value: !economy.transactionLogsChannelId
                ? `Use "Edit Channel" to send logs of ${
                    economy.currencyNameSingular
                  } transfers and item purchases to a channel.`
                : `**Set to <#${economy.transactionLogsChannelId}>**`,
            },
          ],
          thumbnail: {
            url: getEmojiURL(economy.currencySymbol),
          },
        },
      ],
      components: components(
        economyNavBar(i, 'overview'),
        row(
          new ToggleEconomyButton(modules.economy as never)
            .setLabel(t(i, modules.economy ? 'DISABLE_FEATURE' : 'ENABLE_FEATURE'))
            .setStyle(modules.economy ? 'DANGER' : 'SUCCESS'),
          new EditCurrencyButton()
            .setEmoji(emojis.buttons.edit)
            .setStyle('PRIMARY')
            .setLabel('Edit Currency'),
          // new RefreshCommandsButton()
          //   // .setEmoji(emojis.buttons.left_arrowrefresh)
          //   .setStyle('PRIMARY')
          //   .setLabel('Refresh Commands'),
        ),
      ),
    };
  },
};
