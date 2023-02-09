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

export const modReportsSettings: SettingsMenus = {
  getErrors({ guild, settings, isEnabled, i }) {
    const channelId = settings.modReportsChannel;
    const channel = guild.channels.cache.find((c) => c.id === channelId);

    const errors: string[] = [];

    if (isEnabled && channelId && !channel) {
      errors.push('Channel not found. Edit it for CRBT to send new reports.');
    }
    if (isEnabled && !channelId) {
      errors.push(`No channel was set. Use the ${t(i, 'EDIT_CHANNEL')} button to continue setup.`);
    }

    return errors;
  },
  getSelectMenu: ({ settings, guild, isEnabled }) => {
    const channel = guild.channels.cache.find((c) => c.id === settings.modReportsChannel);

    return {
      emoji: isEnabled ? icon(settings.accentColor, 'toggleon') : emojis.toggle.off,
      description: isEnabled ? `Sending in #${channel.name}` : null,
    };
  },
  getMenuDescription({ settings, isEnabled, i }) {
    return {
      description:
        "Moderation Reports allow your members to report a message or user (by right-clicking or long-pressing them) to your server's moderation team. Reports will be sent in the chosen channel.",
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

    await fetchWithCache(
      `${i.guild.id}:settings`,
      () =>
        prisma.servers.upsert({
          where: { id: i.guild.id },
          update: { modReportsChannel: channel.id },
          create: { id: i.guildId, modReportsChannel: channel.id },
          include,
        }),
      true
    );

    i.update(await renderFeatureSettings.call(i, EditableFeatures.moderationReports));
  }
});
