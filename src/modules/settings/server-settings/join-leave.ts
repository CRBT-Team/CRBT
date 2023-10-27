import { emojis } from '$lib/env';
import { deepMerge } from '$lib/functions/deepMerge';
import { t } from '$lib/language';
import {
  CamelCaseGuildFeatures,
  EditableGuildFeatures,
  SettingsMenuProps,
} from '$lib/types/guild-settings';
import { JoinLeaveData } from '$lib/types/messageBuilder';
import { channelMention } from '@purplet/utils';
import { ChannelType } from 'discord-api-types/v10';
import { MessageSelectMenu } from 'discord.js';
import { ButtonComponent, OnEvent, components, row } from 'purplet';
import { MessageBuilder } from '../../components/MessageBuilder';
import { defaultMessage, renderJoinLeavePreview } from '../../joinLeave/renderers';
import { RawServerJoin, RawServerLeave } from '../../joinLeave/types';
import { getGuildSettings, saveServerSettings } from './_helpers';
import { BackSettingsButton, ToggleFeatureBtn, guildFeatureSettings } from './settings';

export const joinLeaveSettings: SettingsMenuProps = {
  description: (l) => t(l, 'SETTINGS_JOIN_LEAVE_SHORT_DESCRIPTION'),
  renderMenuMessage({ settings, i, errors, backBtn }) {
    const { joinMessage: isJoinEnabled, leaveMessage: isLeaveEnabled } = settings.modules;
    const { joinChannelId, leaveChannelId } = settings;

    return {
      embeds: [
        {
          title: t(i, 'JOIN_LEAVE'),
          description: t(i, 'SETTINGS_JOIN_LEAVE_DESCRIPTION'),
          fields: [
            {
              name: `${
                errors.length > 0 ? '⚠️' : isJoinEnabled ? emojis.toggle.on : emojis.toggle.off
              } ${t(i, 'JOIN_MESSAGE')}`,
              value: isJoinEnabled
                ? t(i, 'SETTINGS_SENDING_IN', {
                    channel: channelMention(joinChannelId),
                  })
                : t(i, 'DISABLED'),
            },
            {
              name: `${
                errors.length > 0 ? '⚠️' : isLeaveEnabled ? emojis.toggle.on : emojis.toggle.off
              } ${t(i, 'LEAVE_MESSAGE')}`,
              value: isLeaveEnabled
                ? t(i, 'SETTINGS_SENDING_IN', {
                    channel: channelMention(leaveChannelId),
                  })
                : t(i, 'DISABLED'),
            },
          ],
        },
      ],
      components: components(
        row(
          new ToggleFeatureBtn({
            feature: EditableGuildFeatures.joinMessage,
            newState: !isJoinEnabled,
          })
            .setLabel(t(i, 'JOIN_MESSAGE'))
            .setEmoji(isJoinEnabled ? emojis.toggle.on : emojis.toggle.off)
            .setStyle('SECONDARY'),
          new EditJoinLeaveMessageBtn(EditableGuildFeatures.joinMessage as never)
            .setLabel(t(i, 'EDIT_MESSAGE'))
            .setEmoji(emojis.buttons.pencil)
            .setStyle('PRIMARY')
            .setDisabled(!isJoinEnabled),
          new EditJoinLeaveChannelButton(EditableGuildFeatures.joinMessage)
            .setLabel(t(i, 'EDIT_CHANNEL'))
            .setEmoji(emojis.buttons.pencil)
            .setStyle('PRIMARY')
            .setDisabled(!isJoinEnabled),
        ),
        row(
          new ToggleFeatureBtn({
            feature: EditableGuildFeatures.leaveMessage,
            newState: !isLeaveEnabled,
          })
            .setLabel(t(i, 'LEAVE_MESSAGE'))
            .setEmoji(isLeaveEnabled ? emojis.toggle.on : emojis.toggle.off)
            .setStyle('SECONDARY'),
          new EditJoinLeaveMessageBtn(EditableGuildFeatures.leaveMessage as never)
            .setLabel(t(i, 'EDIT_MESSAGE'))
            .setEmoji(emojis.buttons.pencil)
            .setStyle('PRIMARY')
            .setDisabled(!isLeaveEnabled),
          new EditJoinLeaveChannelButton(EditableGuildFeatures.leaveMessage)
            .setLabel(t(i, 'EDIT_CHANNEL'))
            .setEmoji(emojis.buttons.pencil)
            .setStyle('PRIMARY')
            .setDisabled(!isLeaveEnabled),
        ),
        row(backBtn),
      ),
    };
  },
  getErrors({ guild, settings, i }) {
    const { joinMessage: isJoinEnabled, leaveMessage: isLeaveEnabled } = settings.modules;
    const { joinChannelId, leaveChannelId } = settings;

    const joinChannel = guild.channels.cache.get(joinChannelId);
    const leaveChannel = guild.channels.cache.get(leaveChannelId);

    const errors: string[] = [];

    if (isJoinEnabled && joinChannelId && !joinChannel) {
      errors.push(t(i, 'SETTINGS_ERROR_CHANNEL_NOT_FOUND'));
    }
    if (isJoinEnabled && !joinChannelId) {
      errors.push(t(i, 'SETTINGS_ERROR_CONFIG_NOT_DONE'));
    }
    if (isJoinEnabled && !settings.joinMessage) {
      errors.push(t(i, 'SETTINGS_ERROR_CONFIG_NOT_DONE'));
    }
    if (isLeaveEnabled && leaveChannelId && !leaveChannel) {
      errors.push(t(i, 'SETTINGS_ERROR_CHANNEL_NOT_FOUND'));
    }
    if (isLeaveEnabled && !leaveChannelId) {
      errors.push(t(i, 'SETTINGS_ERROR_CONFIG_NOT_DONE'));
    }
    if (isLeaveEnabled && !settings.leaveMessage) {
      errors.push(t(i, 'SETTINGS_ERROR_CONFIG_NOT_DONE'));
    }

    return errors;
  },
};

export const EditJoinLeaveChannelButton = ButtonComponent({
  async handle(type: string) {
    this.update({
      components: components(
        row(
          new MessageSelectMenu()
            .setCustomId(`${customId}${type}`)
            .setType('CHANNEL_SELECT')
            .setPlaceholder(t(this, 'JOIN_MESSAGE'))
            .setChannelTypes(
              ...([
                ChannelType.GuildText,
                ChannelType.GuildAnnouncement,
                ChannelType.PublicThread,
                ChannelType.PrivateThread,
              ] as number[]),
            ),
        ),
        row(
          new BackSettingsButton(EditableGuildFeatures.joinLeave)
            .setEmoji(emojis.buttons.left_arrow)
            .setStyle('SECONDARY'),
        ),
      ),
    });
  },
});

const customId = 'h_edit_';

export const EditJoinLeaveChannelSelectMenu = OnEvent('interactionCreate', async (i) => {
  if (
    i.isChannelSelect() &&
    [EditableGuildFeatures.joinMessage, EditableGuildFeatures.leaveMessage].includes(
      i.customId.replace(customId, '') as any,
    )
  ) {
    const type = i.customId.replace(customId, '') as EditableGuildFeatures;
    const channel = i.channels.first();

    const propName = type === EditableGuildFeatures.joinMessage ? 'joinChannel' : 'leaveChannel';

    await saveServerSettings(i.guildId, {
      [propName]: channel.id,
    });

    i.update(await guildFeatureSettings.call(i, type));
  }
});

export const EditJoinLeaveMessageBtn = ButtonComponent({
  async handle(type: JoinLeaveData['type']) {
    const data = (await getGuildSettings(this.guild.id))[
      CamelCaseGuildFeatures[type]
    ] as any as JoinLeaveData;

    const builder = MessageBuilder({
      data: {
        type,
        ...deepMerge(defaultMessage.call(this, type), data),
      },
      interaction: this,
    });

    await this.update(builder);
  },
});

export const TestJoinLeaveBtn = ButtonComponent({
  async handle(type: JoinLeaveData['type']) {
    const data = (await getGuildSettings(this.guild.id)) as any as RawServerJoin | RawServerLeave;

    await renderJoinLeavePreview.call(this, type, data);
  },
});
