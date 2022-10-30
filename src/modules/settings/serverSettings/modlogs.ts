import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { emojis } from '$lib/env';
import { CRBTError } from '$lib/functions/CRBTError';
import { EditableFeatures, SettingsMenus } from '$lib/types/settings';
import { SnowflakeRegex } from '@purplet/utils';
import { TextInputComponent } from 'discord.js';
import { ButtonComponent, components, ModalComponent, row } from 'purplet';
import { getSettings, renderFeatureSettings, strings } from './settings';

export const modlogsSettings: SettingsMenus = {
  getMenuDescription: ({ settings, guild }) => {
    const channel = guild.channels.cache.find((c) => c.id === settings.modLogsChannel);
    const isEnabled = settings.modules.moderationLogs;

    return {
      description:
        `Moderation logs allow you to get realtime notifications in any channel for every moderation action a moderator takes using CRBT!\nThis feature is currently ${
          isEnabled ? 'enabled' : 'disabled'
        } in this server.` +
        (!isEnabled
          ? ''
          : '\n' +
            (channel
              ? `Moderation logs are currently sent in ${channel}.`
              : '**⚠️ The channel where messages are sent is no longer accessible or has been deleted. Please edit it in order to receive them.**')) +
        `\nUse the buttons below to configure the feature or to ${
          isEnabled ? 'enable' : 'disable'
        } it.`,
    };
  },
  getSelectMenu: ({ settings, feature, guild }) => {
    const isEnabled = settings.modules.moderationLogs;
    const channel = guild.channels.cache.find((c) => c.id === settings.modLogsChannel);

    return {
      label: strings.MODERATION_LOGS,
      emoji: emojis.toggle[isEnabled ? 'on' : 'off'],
      description: isEnabled
        ? `Sending in ${channel ? `#${channel.name}` : '[Channel Deleted]'}`
        : 'Disabled',
      value: feature,
    };
  },
  getComponents: ({ backBtn, toggleBtn }) =>
    components(
      row(
        backBtn,
        toggleBtn,
        new EditModLogsChannelBtn()
          .setLabel(`Edit Channel`)
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
              .setPlaceholder("You may use a Text Channel's exact name or its ID.")
              .setLabel('Channel')
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

    const channel = SnowflakeRegex.test(channelInput)
      ? await this.guild.channels.fetch(channelInput)
      : (await this.guild.channels.fetch())?.find((c) => c.name === channelInput);

    if (!channel || channel.type !== 'GUILD_TEXT') {
      return CRBTError(this, 'This channel does not exist or is not a text channel.');
    }

    await fetchWithCache(
      `${this.guild.id}:settings`,
      () =>
        prisma.servers.upsert({
          create: {
            id: this.guildId,
            modLogsChannel: channel.id,
          },
          update: { modLogsChannel: channel.id },
          where: { id: this.guildId },
        }),
      true
    );

    this.update(await renderFeatureSettings.call(this, EditableFeatures.moderationLogs));
  },
});
