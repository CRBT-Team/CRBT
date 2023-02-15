import { emojis } from '$lib/env';
import { icon } from '$lib/env/emojis';
import { t } from '$lib/language';
import { EditableFeatures, SettingsMenus } from '$lib/types/settings';
import { ChannelType } from 'discord-api-types/v10';
import { MessageSelectMenu } from 'discord.js';
import { components, OnEvent, row } from 'purplet';
import { renderFeatureSettings } from './settings';
import { saveServerSettings } from './_helpers';

export const modReportsSettings: SettingsMenus = {
  getErrors({ guild, settings, isEnabled, i }) {
    const channelId = settings.modReportsChannel;
    const channel = guild.channels.cache.find((c) => c.id === channelId);

    const errors: string[] = [];

    if (isEnabled && channelId && !channel) {
      errors.push(t(i, 'SETTINGS_ERROR_CHANNEL_NOT_FOUND'));
    }
    if (isEnabled && !channelId) {
      errors.push(t(i, 'SETTINGS_ERROR_CONFIG_NOT_DONE'));
    }

    return errors;
  },
  getSelectMenu: ({ settings, guild, isEnabled, i }) => {
    const channel = guild.channels.cache.find((c) => c.id === settings.modReportsChannel);

    return {
      emoji: isEnabled ? icon(settings.accentColor, 'toggleon') : emojis.toggle.off,
      description: isEnabled
        ? t(i, 'SETTINGS_SENDING_IN', {
            channel: `#${channel?.name}`,
          })
        : null,
    };
  },
  getMenuDescription({ settings, isEnabled, i }) {
    return {
      description: t(i, 'SETTINGS_MODREPORTS_DESCRIPTION'),
      fields: [
        {
          name: t(i, 'STATUS'),
          value: isEnabled
            ? `${icon(settings.accentColor, 'toggleon')} ${t(i, 'ENABLED')}`
            : `${emojis.toggle.off} ${t(i, 'DISABLED')}`,
          inline: true,
        },
        ...(settings.modReportsChannel
          ? [
              {
                name: t(i, 'CHANNEL'),
                value: `<#${settings.modReportsChannel}>`,
                inline: true,
              },
            ]
          : []),
      ],
    };
  },
  getComponents: ({ backBtn, toggleBtn, i, isEnabled }) =>
    components(
      row(backBtn, toggleBtn),
      row(
        new MessageSelectMenu()
          .setType('CHANNEL_SELECT')
          .addChannelTypes(
            ...([
              ChannelType.GuildText,
              ChannelType.GuildAnnouncement,
              ChannelType.PublicThread,
              ChannelType.PrivateThread,
            ] as number[])
          )
          .setCustomId(customId)
          .setDisabled(!isEnabled)
          .setPlaceholder(t(i, 'EDIT_CHANNEL'))
      )
    ),
};

const customId = 'hselect';

export const EditChannelSelectMenu = OnEvent('interactionCreate', async (i) => {
  if (i.isChannelSelect() && i.customId === customId) {
    const channel = i.channels.first();

    await saveServerSettings(i.guildId, {
      modReportsChannel: channel.id,
    });

    i.update(await renderFeatureSettings.call(i, EditableFeatures.moderationReports));
  }
});
