import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { emojis } from '$lib/env';
import { CRBTError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { EditableFeatures, SettingsMenus } from '$lib/types/settings';
import { SnowflakeRegex } from '@purplet/utils';
import { Channel, TextInputComponent } from 'discord.js';
import { ButtonComponent, components, ModalComponent, row } from 'purplet';
import { renderFeatureSettings } from './settings';
import { getSettings, include } from './_helpers';

export const modlogsSettings: SettingsMenus = {
  getErrors({ guild, settings, isEnabled }) {
    const channelId = settings.modLogsChannel;
    const channel = guild.channels.cache.find((c) => c.id === channelId);

    const errors: string[] = [];

    if (isEnabled && channelId && !channel) {
      errors.push('Channel not found. Edit it for CRBT to send new moderation logs.');
    }
    if (isEnabled && !channelId) {
      errors.push(
        'No channel was set. Set it using the {button_label} button below to continue setup.'
      );
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
          value: isEnabled ? `${emojis.toggle.on} Enabled` : `${emojis.toggle.off} Disabled`,
        },
        {
          name: 'Channel',
          value: `#${settings.modLogsChannel}`,
          inline: true,
        },
      ],
    };
  },
  getSelectMenu({ settings, guild }) {
    const channel = guild.channels.cache.find((c) => c.id === settings.modLogsChannel);

    return {
      emoji: emojis.toggle[settings.modules.moderationLogs ? 'on' : 'off'],
      description: settings.modules.moderationLogs ? `Sending in #${channel.name}` : null,
    };
  },
  getComponents: ({ backBtn, toggleBtn, i }) =>
    components(
      row(
        backBtn,
        toggleBtn,
        new EditModLogsChannelBtn()
          .setLabel(t(i, 'EDIT_CHANNEL'))
          .setEmoji(emojis.buttons.pencil)
          .setStyle('PRIMARY')
      )
    ),
};

export const EditModLogsChannelBtn = ButtonComponent({
  async handle() {
    const settings = await getSettings(this.guild.id);
    const channelId = settings.modLogsChannel;

    const channelName = channelId ? this.guild.channels.cache.get(channelId)?.name ?? '' : '';

    this.showModal(
      new EditModLogsChannelModal(null)
        .setTitle(`Edit Moderation Logs Channel`)
        .setComponents(
          row(
            new TextInputComponent()
              .setCustomId('channel')
              .setPlaceholder(t(this, "EDIT_CHANNEL_MODAL_PLACEHOLDER"))
              .setLabel(t(this, "CHANNEL"))
              .setValue(channelName)
              .setRequired(true)
              .setStyle('SHORT')
              .setMaxLength(100)
          )
        )
    );
  },
});

export const EditModLogsChannelModal = ModalComponent({
  async handle() {
    const channelInput = this.fields.getTextInputValue('channel');
    let channel: Channel;

    if (SnowflakeRegex.test(channelInput)) {
      channel = this.guild.channels.cache.get(channelInput);
      if (!channel || channel.type !== 'GUILD_TEXT') {
        return CRBTError(this, 'This channel does not exist or is not a text channel.');
      }
    } else {
      channel = this.guild.channels.cache.find((c) => c.name === channelInput);
      if (!channel || channel.type !== 'GUILD_TEXT') {
        return CRBTError(this, 'This channel does not exist or is not a text channel.');
      }
    }

    await fetchWithCache(
      `${this.guild.id}:settings`,
      () =>
        prisma.servers.upsert({
          where: { id: this.guild.id },
          update: { modLogsChannel: channel.id },
          create: { id: this.guildId, modLogsChannel: channel.id },
          include,
        }),
      true
    );

    this.update(await renderFeatureSettings.call(this, EditableFeatures.moderationLogs));
  },
});
