import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { emojis } from '$lib/env';
import { icon } from '$lib/env/emojis';
import { t } from '$lib/language';
import { EditableFeatures, SettingsMenus } from '$lib/types/settings';
import { ChannelType } from 'discord-api-types/v10';
import { MessageSelectMenu } from 'discord.js';
import { components, OnEvent, row } from 'purplet';
import { renderFeatureSettings } from './settings';
import { include } from './_helpers';

export const modlogsSettings: SettingsMenus = {
  getErrors({ guild, settings, isEnabled, i }) {
    const channelId = settings.modLogsChannel;
    const channel = guild.channels.cache.find((c) => c.id === channelId);

    const errors: string[] = [];

    if (isEnabled && channelId && !channel) {
      errors.push('Channel not found. Edit it for CRBT to send new moderation logs.');
    }
    if (isEnabled && !channelId) {
      errors.push(`No channel was set. Use the ${t(i, 'EDIT_CHANNEL')} button to continue setup.`);
    }

    return errors;
  },
  getMenuDescription({ settings, isEnabled, i }) {
    return {
      description:
        'Moderation logs allow you to get realtime notifications in any channel for every moderation action a moderator takes using CRBT!',
      fields: [
        {
          name: t(i, 'STATUS'),
          value: isEnabled
            ? `${icon(settings.accentColor, 'toggleon')} ${t(i, 'ENABLED')}`
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
    };
  },
  getSelectMenu({ settings, guild, isEnabled }) {
    const channel = guild.channels.cache.find((c) => c.id === settings.modLogsChannel);

    return {
      emoji: isEnabled ? icon(settings.accentColor, 'toggleon') : emojis.toggle.off,
      description: isEnabled ? `Sending in #${channel.name}` : null,
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

    await fetchWithCache(
      `${i.guild.id}:settings`,
      () =>
        prisma.servers.upsert({
          where: { id: i.guild.id },
          update: { modLogsChannel: channel.id },
          create: { id: i.guildId, modLogsChannel: channel.id },
          include,
        }),
      true
    );

    i.update(await renderFeatureSettings.call(i, EditableFeatures.moderationLogs));
  }
});
