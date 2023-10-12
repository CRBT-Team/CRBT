import { emojis } from '$lib/env';
import { t } from '$lib/language';
import { EditableGuildFeatures, SettingsMenuProps } from '$lib/types/guild-settings';
import { ChannelType } from 'discord-api-types/v10';
import { MessageSelectMenu } from 'discord.js';
import { OnEvent, components, row } from 'purplet';
import { saveServerSettings } from './_helpers';
import { ToggleFeatureBtn, guildFeatureSettings } from './settings';

export const modlogsSettings: SettingsMenuProps = {
  mainMenu: EditableGuildFeatures.moderation,
  description: (l) => t(l, 'SETTINGS_MODLOGS_SHORT_DESCRIPTION'),
  getErrors({ guild, settings, i }) {
    const channelId = settings.modLogsChannelId;
    const channel = guild.channels.cache.find((c) => c.id === channelId);

    const errors: string[] = [];

    if (settings.modules.moderationNotifications && channelId && !channel) {
      errors.push(t(i, 'SETTINGS_ERROR_CHANNEL_NOT_FOUND'));
    }
    if (settings.modules.moderationNotifications && !channelId) {
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
              value: settings.modules.moderationNotifications
                ? `${emojis.toggle.on} ${t(i, 'ENABLED')}`
                : `${emojis.toggle.off} ${t(i, 'DISABLED')}`,
              inline: true,
            },
            ...(settings.modLogsChannelId
              ? [
                  {
                    name: t(i, 'CHANNEL'),
                    value: `<#${settings.modLogsChannelId}>`,
                    inline: true,
                  },
                ]
              : []),
          ],
        },
      ],
      components: components(
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
            .setCustomId(modlogsCustomId)
            .setDisabled(!settings.modules.moderationNotifications)
            .setPlaceholder(t(i, 'EDIT_CHANNEL')),
        ),
        row(
          backBtn,
          new ToggleFeatureBtn({
            feature: EditableGuildFeatures.moderationNotifications,
            newState: !settings.modules.moderationNotifications,
          })
            .setLabel(settings.modules.moderationNotifications ? t(i, 'DISABLE') : t(i, 'ENABLE'))
            .setLabel(
              settings.modules.moderationNotifications
                ? t(i, 'DISABLE_FEATURE')
                : t(i, 'ENABLE_FEATURE'),
            )
            .setStyle(settings.modules.moderationNotifications ? 'DANGER' : 'SUCCESS'),
        ),
      ),
    };
  },
};

export const modlogsCustomId = 'hlogsselect';

export const EditLogsChannelSelectMenu = OnEvent('interactionCreate', async (i) => {
  if (i.isChannelSelect() && i.customId === modlogsCustomId) {
    const channel = i.channels.first();

    await saveServerSettings(i.guildId, {
      modLogsChannelId: channel.id,
    });

    i.update(await guildFeatureSettings.call(i, EditableGuildFeatures.moderationNotifications));
  }
});
