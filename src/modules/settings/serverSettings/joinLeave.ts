import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { emojis } from '$lib/env';
import { CRBTError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { JoinLeaveData } from '$lib/types/messageBuilder';
import { CamelCaseFeatures, EditableFeatures, SettingsMenus } from '$lib/types/settings';
import { SnowflakeRegex } from '@purplet/utils';
import { Channel, TextInputComponent } from 'discord.js';
import { ButtonComponent, components, ModalComponent, row } from 'purplet';
import { MessageBuilder } from '../../components/MessageBuilder';
import { defaultMessage } from '../../joinLeave/renderers';
import { RawServerJoin, RawServerLeave } from '../../joinLeave/types';
import { renderFeatureSettings } from './settings';
import { getSettings, include } from './_helpers';

export const joinLeaveSettings: SettingsMenus = {
  getErrors({ guild, settings, feature }) {
    const isEnabled = settings.modules[CamelCaseFeatures[feature]];
    const channelId =
      settings[feature === EditableFeatures.joinMessage ? 'joinChannel' : 'leaveChannel'];
    const channel = guild.channels.cache.find((c) => c.id === channelId);

    const errors: string[] = [];

    if (isEnabled && channelId && !channel) {
      errors.push('Channel not found. Edit it for CRBT to send new messages.');
    }
    if (isEnabled && !channelId) {
      errors.push(
        'No channel was set. Set it using the {button_label} button below to continue setup.'
      );
    }
    if (isEnabled && !settings[CamelCaseFeatures[feature]]) {
      errors.push(
        'No message was set. Set it using the {button_label} button below to continue setup.'
      );
    }

    return errors;
  },
  getMenuDescription({ settings, feature, isEnabled, i }) {
    const channelId =
      settings[feature === EditableFeatures.joinMessage ? 'joinChannel' : 'leaveChannel'];

    return {
      fields: [
        {
          name: t(i, 'STATUS'),
          value: isEnabled
            ? `${emojis.toggle.on} ${t(i, 'ENABLED')}`
            : `${emojis.toggle.off} ${t(i, 'DISABLED')}`,
        },
        ...(channelId
          ? [
              {
                name: 'Channel',
                value: `<#${channelId}>`,
                inline: true,
              },
            ]
          : []),
      ],
    };
  },
  getSelectMenu: ({ settings, feature, i }) => {
    const channelId =
      settings[feature === EditableFeatures.joinMessage ? 'joinChannel' : 'leaveChannel'];

    const channel = i.guild.channels.cache.find((c) => c.id === channelId);
    const isEnabled = settings.modules[CamelCaseFeatures[feature]];

    return {
      emoji: emojis.toggle[isEnabled ? 'on' : 'off'],
      description: isEnabled
        ? t(i, 'SETTINGS_SENDING_IN', {
            channel: `#${channel.name}`,
          })
        : '',
    };
  },
  getComponents: ({ feature, toggleBtn, backBtn, isEnabled, i }) =>
    components(
      row(backBtn, toggleBtn),
      row(
        new EditJoinLeaveMessageBtn(feature as never)
          .setLabel(t(i, 'EDIT_MESSAGE'))
          .setEmoji(emojis.buttons.pencil)
          .setStyle('PRIMARY')
          .setDisabled(!isEnabled),
        new EditJoinLeaveChannelBtn(feature as never)
          .setLabel(t(i, 'EDIT_CHANNEL'))
          .setEmoji(emojis.buttons.pencil)
          .setStyle('PRIMARY')
          .setDisabled(!isEnabled)
      )
    ),
};

export const EditJoinLeaveChannelBtn = ButtonComponent({
  async handle(type: JoinLeaveData['type']) {
    const data = (await getSettings(this.guild.id)) as RawServerJoin | RawServerLeave;
    const channelId = data[type === EditableFeatures.joinMessage ? 'joinChannel' : 'leaveChannel'];
    const channelName = channelId ? this.guild.channels.cache.get(channelId)?.name ?? '' : '';

    this.showModal(
      new EditJoinLeaveChannelModal(type as never)
        .setTitle(
          t(this, 'EDIT_SOMETHING', {
            feature: t(this, type),
          })
        )
        .setComponents(
          row(
            new TextInputComponent()
              .setCustomId('channel')
              .setPlaceholder(t(this, 'EDIT_CHANNEL_MODAL_PLACEHOLDER'))
              .setLabel(t(this, 'CHANNEL'))
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
    const propName = type === EditableFeatures.joinMessage ? 'joinChannel' : 'leaveChannel';

    const res = await fetchWithCache(
      `${this.guild.id}:settings`,
      () =>
        prisma.servers.upsert({
          where: { id: this.guild.id },
          update: { [propName]: channel.id },
          create: { id: this.guildId, [propName]: channel.id },
          include,
        }),
      true
    );

    console.log(res);

    this.update(await renderFeatureSettings.call(this, type as string as EditableFeatures));
  },
});

export const EditJoinLeaveMessageBtn = ButtonComponent({
  async handle(type: JoinLeaveData['type']) {
    const data = (await getSettings(this.guild.id))[
      CamelCaseFeatures[type]
    ] as any as JoinLeaveData;

    const builder = MessageBuilder({
      data: {
        type,
        ...defaultMessage.call(this, type),
        ...data,
      },
      interaction: this,
    });

    await this.update(builder);
  },
});
