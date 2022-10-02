import { cache } from "$lib/cache";
import { emojis } from "$lib/db";
import { CRBTError } from "$lib/functions/CRBTError";
import { t } from "$lib/language";
import { JoinLeaveData, MessageBuilderTypes } from "$lib/types/messageBuilder";
import { CamelCaseFeatures, EditableFeatures, SettingsMenus } from "$lib/types/settings";
import { SnowflakeRegex } from "$lib/util/regex";
import { TextInputComponent, Channel } from "discord.js";
import { ButtonComponent, row, ModalComponent, components } from "purplet";
import { MessageBuilder } from "../../components/MessageBuilder";
import { RawServerJoin, RawServerLeave, resolveMsgType } from "../../joinLeave/types";
import { getSettings, renderFeatureSettings, strings } from "./settings";

export const joinLeaveSettings: SettingsMenus = {
  getMenuDescription: ({ settings, feature, guild }) => {
    const isEnabled = settings.modules[resolveMsgType[feature]];
    const channelId =
      settings[feature === EditableFeatures.joinMessage ? 'joinChannel' : 'leaveChannel'];
    const channel = guild.channels.cache.find((c) => c.id === channelId);

    return {
      description:
        `This feature is currently ${isEnabled ? 'enabled' : 'disabled'} in this server.` +
        (!isEnabled
          ? ''
          : '\n' +
          (channel
            ? `Messages currently are sent in ${channel}.`
            : '**⚠️ The channel where messages are sent is no longer accessible or has been deleted. Please change it in order to receive them.**')) +
        `\nUse the buttons below to configure the feature or to ${isEnabled ? 'enable' : 'disable'
        } it.`,
    };
  },
  getSelectMenu: ({ settings, feature, i }) => {
    const channelId = settings[CamelCaseFeatures[feature]];

    console.log(channelId)

    const channel = i.guild.channels.cache.find((c) => c.id === channelId);

    return {
      label: strings[feature],
      emoji: emojis.toggle[settings.modules[CamelCaseFeatures[feature]] ? 'on' : 'off'],
      description: `Sending in ${channel ? `#${channel.name}` : '[Channel Deleted]'}`,
      value: feature,
    };
  },
  getComponents: ({ feature, toggleBtn, backBtn }) => components(
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
  )
}

export const EditJoinLeaveChannelBtn = ButtonComponent({
  async handle(type: JoinLeaveData['type']) {
    const data = (await getSettings(this.guild.id)) as RawServerJoin | RawServerLeave;
    const channelId =
      data[type === MessageBuilderTypes.joinMessage ? 'joinChannel' : 'leaveChannel'];
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
    data[type === MessageBuilderTypes.joinMessage ? 'joinChannel' : 'leaveChannel'] = channel.id;
    cache.set(`${this.guild.id}:settings`, data);

    this.update(await renderFeatureSettings.call(this, type));
  },
});

export const EditJoinLeaveMessageBtn = ButtonComponent({
  async handle(type: JoinLeaveData['type']) {
    const data = (await getSettings(this.guild.id)) as RawServerJoin | RawServerLeave;

    const builder = MessageBuilder({
      data: {
        type,
        ...data[resolveMsgType[type]],
      },
      interaction: this,
    });

    await this.update(builder);
  },
});
