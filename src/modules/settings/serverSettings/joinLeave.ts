import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { emojis } from '$lib/env';
import { CRBTError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { JoinLeaveData, MessageBuilderTypes } from '$lib/types/messageBuilder';
import { CamelCaseFeatures, SettingsMenus } from '$lib/types/settings';
import { SnowflakeRegex } from '@purplet/utils';
import { TextInputComponent } from 'discord.js';
import { ButtonComponent, components, ModalComponent, row } from 'purplet';
import { MessageBuilder } from '../../components/MessageBuilder';
import { RawServerJoin, RawServerLeave } from '../../joinLeave/types';
import { getSettings, renderFeatureSettings, strings } from './settings';

export const joinLeaveSettings: SettingsMenus = {
  getMenuDescription: ({ settings, feature, guild }) => {
    const channelId = settings[CamelCaseFeatures[feature]] as string;
    const isEnabled = settings.modules[CamelCaseFeatures[feature]] as boolean;
    const channel = guild.channels.cache.find((c) => c.id === channelId);

    return {
      description:
        `This feature is currently ${isEnabled ? 'enabled' : 'disabled'} in this server.` +
        (!isEnabled
          ? ''
          : '\n' +
            (channel
              ? `Messages are currently sent in ${channel}.`
              : '**⚠️ The channel where messages are sent is no longer accessible or has been deleted. Please edit it in order to receive them.**')) +
        `\nUse the buttons below to configure the feature or to ${
          isEnabled ? 'enable' : 'disable'
        } it.`,
    };
  },
  getSelectMenu: ({ settings, feature, i }) => {
    const channelId = settings[CamelCaseFeatures[feature]] as string;
    const isEnabled = settings.modules[CamelCaseFeatures[feature]] as boolean;
    const channel = i.guild.channels.cache.find((c) => c.id === channelId);

    return {
      label: strings[feature],
      emoji: emojis.toggle[isEnabled ? 'on' : 'off'],
      description: isEnabled
        ? `Sending in ${channel ? `#${channel.name}` : '[Channel Deleted]'}`
        : 'Disabled',
      value: feature,
    };
  },
  getComponents: ({ feature, toggleBtn, backBtn }) =>
    components(
      row(backBtn, toggleBtn),
      row(
        new EditJoinLeaveMessageBtn(feature as never)
          .setLabel(`Edit Message`)
          .setEmoji(emojis.buttons.pencil)
          .setStyle('PRIMARY'),
        new EditJoinLeaveChannelBtn(feature as never)
          .setLabel(`Edit Channel`)
          .setEmoji(emojis.buttons.pencil)
          .setStyle('PRIMARY')
      )
    ),
};

export const EditJoinLeaveChannelBtn = ButtonComponent({
  async handle(type: JoinLeaveData['type']) {
    const data = (await getSettings(this.guild.id)) as RawServerJoin | RawServerLeave;
    const channelId = data[CamelCaseFeatures[type]];
    const channelName = channelId ? this.guild.channels.cache.get(channelId)?.name ?? '' : '';

    this.showModal(
      new EditJoinLeaveChannelModal(type as never)
        .setTitle(
          `Edit ${t(
            this.locale,
            type === MessageBuilderTypes.joinMessage ? 'JOIN_CHANNEL' : 'LEAVE_CHANNEL'
          )}`
        )
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

export const EditJoinLeaveChannelModal = ModalComponent({
  async handle(type: JoinLeaveData['type']) {
    const channelInput = this.fields.getTextInputValue('channel');

    const channel = SnowflakeRegex.test(channelInput)
      ? await this.guild.channels.fetch(channelInput)
      : (await this.guild.channels.fetch()).find((c) => c.name === channelInput);

    if (!channel || channel.type !== 'GUILD_TEXT') {
      return CRBTError(this, 'This channel does not exist or is not a text channel.');
    }

    await fetchWithCache(
      `${this.guild.id}:settings`,
      () =>
        prisma.servers.upsert({
          create: {
            id: this.guildId,
            [CamelCaseFeatures[type]]: channel.id,
          },
          update: {
            [CamelCaseFeatures[type]]: channel.id,
          },
          where: { id: this.guildId },
        }),
      true
    );

    this.update(await renderFeatureSettings.call(this, type));
  },
});

export const EditJoinLeaveMessageBtn = ButtonComponent({
  async handle(type: JoinLeaveData['type']) {
    const data = (await getSettings(this.guild.id)) as RawServerJoin | RawServerLeave;

    const builder = MessageBuilder({
      data: {
        type,
        ...data[CamelCaseFeatures[type]],
      },
      interaction: this,
    });

    await this.update(builder);
  },
});
