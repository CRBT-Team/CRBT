import { emojis } from '$lib/env';
import { t } from '$lib/language';
import { EditableGuildFeatures, SettingsMenuProps } from '$lib/types/guild-settings';
import { ChannelType } from 'discord-api-types/v10';
import { MessageSelectMenu } from 'discord.js';
import { OnEvent, components, row } from 'purplet';
import { saveServerSettings } from './_helpers';
import { guildFeatureSettings } from './settings';

export const modReportsSettings: SettingsMenuProps = {
  description: (l) => t(l, 'SETTINGS_MODREPORTS_DESCRIPTION'),
  getErrors({ guild, settings, i }) {
    const channelId = settings.modReportsChannelId;
    const channel = guild.channels.cache.find((c) => c.id === channelId);

    const errors: string[] = [];

    if (settings.modules.moderationReports && channelId && !channel) {
      errors.push(t(i, 'SETTINGS_ERROR_CHANNEL_NOT_FOUND'));
    }
    if (settings.modules.moderationReports && !channelId) {
      errors.push(t(i, 'SETTINGS_ERROR_CONFIG_NOT_DONE'));
    }

    return errors;
  },
  renderMenuMessage({ settings, i, backBtn }) {
    return {
      embeds: [
        {
          description: t(i, 'SETTINGS_MODREPORTS_DESCRIPTION'),
          fields: [
            {
              name: t(i, 'STATUS'),
              value: settings.modules.moderationReports
                ? `${emojis.toggle.on} ${t(i, 'ENABLED')}`
                : `${emojis.toggle.off} ${t(i, 'DISABLED')}`,
              inline: true,
            },
            ...(settings.modReportsChannelId
              ? [
                  {
                    name: t(i, 'CHANNEL'),
                    value: `<#${settings.modReportsChannelId}>`,
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
              ] as number[]),
            )
            .setCustomId(customId)
            .setDisabled(!settings.modules.moderationReports)
            .setPlaceholder(t(i, 'EDIT_CHANNEL')),
        ),
      ),
    };
  },
};

const customId = 'hreportsselect';

export const EditReportsChannelSelectMenu = OnEvent('interactionCreate', async (i) => {
  if (i.isChannelSelect() && i.customId === customId) {
    const channel = i.channels.first();

    await saveServerSettings(i.guildId, {
      modReportsChannelId: channel.id,
    });

    i.update(await guildFeatureSettings.call(i, EditableGuildFeatures.moderationReports));
  }
});
