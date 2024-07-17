import { Interaction, MessageButton } from 'discord.js';
import { row } from 'purplet';
import { BackSettingsButton } from '../settings';
import { emojis } from '$lib/env';
import { EditableGuildFeatures } from '$lib/types/guild-settings';
import { t } from '$lib/language';
import { ShopButton } from './MenuShop';

type Tabs = 'overview' | 'shop' | 'commands';

export function economyNavBar(i: Interaction, activeTab: Tabs) {
  return row(
    new BackSettingsButton(null).setEmoji(emojis.buttons.left_arrow).setStyle('SECONDARY'),
    new BackSettingsButton(EditableGuildFeatures.economy)
      .setStyle('SECONDARY')
      .setLabel(t(i.locale, 'OVERVIEW'))
      .setDisabled(activeTab === 'overview'),
    new ShopButton()
      .setStyle('SECONDARY')
      .setLabel('Shop')
      .setDisabled(activeTab === 'shop'),
    new MessageButton()
      .setStyle('SECONDARY')
      .setLabel('Income commands')
      .setCustomId('commands')
      .setDisabled(activeTab === 'commands'),
  );
}
