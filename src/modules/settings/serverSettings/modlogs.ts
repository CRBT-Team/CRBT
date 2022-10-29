import { cache } from '$lib/cache';
import { prisma } from '$lib/db';
import { emojis } from '$lib/env';
import { CRBTError } from '$lib/functions/CRBTError';
import { EditableFeatures, SettingsMenus } from '$lib/types/settings';
import { SnowflakeRegex } from '@purplet/utils';
import { Channel, TextInputComponent } from 'discord.js';
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
    const channel = guild.channels.cache.find((c) => c.id === settings.modLogsChannel);

    return {
      label: strings.MODERATION_LOGS,
      emoji: emojis.toggle[settings.modules.moderationLogs ? 'on' : 'off'],
      description: `Sending in ${channel ? `#${channel.name}` : '[Channel Deleted]'}`,
      value: feature,
    };
  },
  getComponents: ({ feature, backBtn, toggleBtn }) =>
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
    const data = await getSettings(this.guild.id);
    data.modLogsChannel = channel.id;
    cache.set(`${this.guild.id}:settings`, data);

    await prisma.servers.upsert({
      create: {
        id: this.guildId,
        modLogsChannel: data.modLogsChannel,
      },
      update: { modLogsChannel: data.modLogsChannel },
      where: { id: this.guildId },
    });

    this.update(await renderFeatureSettings.call(this, EditableFeatures.moderationLogs));
  },
});
