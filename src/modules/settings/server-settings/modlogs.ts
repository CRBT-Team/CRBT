import { emojis } from '$lib/env';
import { t } from '$lib/language';
import { EditableGuildFeatures, SettingsMenuProps } from '$lib/types/guild-settings';
import { ChannelType } from 'discord-api-types/v10';
import { MessageSelectMenu } from 'discord.js';
import { components, OnEvent, row } from 'purplet';
import { guildFeatureSettings } from './settings';
import { saveServerSettings } from './_helpers';

export const modlogsSettings: SettingsMenuProps = {
  description: (l) => t(l, 'SETTINGS_MODLOGS_DESCRIPTION'),
  getErrors({ guild, settings, i }) {
    const channelId = settings.modLogsChannel;
    const channel = guild.channels.cache.find((c) => c.id === channelId);

    const errors: string[] = [];

    if (settings.modules.moderationLogs && channelId && !channel) {
      errors.push(t(i, 'SETTINGS_ERROR_CHANNEL_NOT_FOUND'));
    }
    if (settings.modules.moderationLogs && !channelId) {
      errors.push(t(i, 'SETTINGS_ERROR_CONFIG_NOT_DONE'));
    }

    return errors;
  },
  renderMenuMessage({ settings, i, backBtn }) {
    return {
      embeds: [
        {
          description: t(i, 'SETTINGS_MODLOGS_DESCRIPTION'),
          fields: [
            {
              name: t(i, 'STATUS'),
              value: settings.modules.moderationLogs
                ? `${emojis.toggle.on} ${t(i, 'ENABLED')}`
                : `${emojis.toggle.off} ${t(i, 'DISABLED')}`,
              inline: true,
            },
            ...(settings.modLogsChannel
              ? [
                  {
                    name: t(i, 'CHANNEL'),
                    value: `<#${settings.modLogsChannel}>`,
                    inline: true,
                  },
                ]
              : []),
          ],
        },
      ],
      components: components(
        row(backBtn),
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
            .setDisabled(!settings.modules.moderationLogs)
            .setPlaceholder(t(i, 'EDIT_CHANNEL'))
        )
      ),
    };
  },
};

const customId = 'hlogsselect';

export const EditLogsChannelSelectMenu = OnEvent('interactionCreate', async (i) => {
  if (i.isChannelSelect() && i.customId === customId) {
    const channel = i.channels.first();

    await saveServerSettings(i.guildId, {
      modLogsChannel: channel.id,
    });

    i.update(await guildFeatureSettings.call(i, EditableGuildFeatures.moderationLogs));
  }
});
