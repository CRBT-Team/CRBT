import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { emojis } from '$lib/env';
import { icon } from '$lib/env/emojis';
import { deepMerge } from '$lib/functions/deepMerge';
import { t } from '$lib/language';
import { JoinLeaveData } from '$lib/types/messageBuilder';
import { CamelCaseFeatures, EditableFeatures, SettingsMenus } from '$lib/types/settings';
import { ChannelType } from 'discord-api-types/v10';
import { MessageSelectMenu } from 'discord.js';
import { ButtonComponent, components, OnEvent, row } from 'purplet';
import { MessageBuilder } from '../../components/MessageBuilder';
import { defaultMessage, renderJoinLeavePreview } from '../../joinLeave/renderers';
import { RawServerJoin, RawServerLeave } from '../../joinLeave/types';
import { renderFeatureSettings } from './settings';
import { getSettings, include } from './_helpers';

export const joinLeaveSettings: SettingsMenus = {
  getErrors({ guild, settings, feature, i }) {
    const isEnabled = settings.modules[CamelCaseFeatures[feature]];
    const channelId =
      settings[feature === EditableFeatures.joinMessage ? 'joinChannel' : 'leaveChannel'];
    const channel = guild.channels.cache.get(channelId);

    const errors: string[] = [];

    if (isEnabled && channelId && !channel) {
      errors.push('Channel not found. Edit it for CRBT to send new messages.');
    }
    if (isEnabled && !channelId) {
      errors.push(`No channel was set. Use the ${t(i, 'EDIT_CHANNEL')} button to continue setup.`);
    }
    if (isEnabled && !settings[CamelCaseFeatures[feature]]) {
      errors.push(`No message was set. Use the ${t(i, 'EDIT_MESSAGE')} button to continue setup.`);
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
            ? `${icon(settings.accentColor, 'toggleon')} ${t(i, 'ENABLED')}`
            : `${emojis.toggle.off} ${t(i, 'DISABLED')}`,
        },
        ...(channelId
          ? [
              {
                name: t(i, 'CHANNEL'),
                value: `<#${channelId}>`,
                inline: true,
              },
            ]
          : []),
      ],
    };
  },
  getSelectMenu: ({ settings, feature, i, isEnabled }) => {
    const channelId =
      settings[feature === EditableFeatures.joinMessage ? 'joinChannel' : 'leaveChannel'];
    const channel = i.guild.channels.cache.get(channelId);

    return {
      emoji: isEnabled ? icon(settings.accentColor, 'toggleon') : emojis.toggle.off,
      description: isEnabled
        ? t(i, 'SETTINGS_SENDING_IN', {
            channel: `#${channel?.name}`,
          })
        : '',
    };
  },
  getComponents: ({ feature, toggleBtn, backBtn, isEnabled, i, errors }) =>
    components(
      row(backBtn, toggleBtn),
      row(
        new EditJoinLeaveMessageBtn(feature as never)
          .setLabel(t(i, 'EDIT_MESSAGE'))
          .setEmoji(emojis.buttons.pencil)
          .setStyle('PRIMARY')
          .setDisabled(!isEnabled),
        // new EditJoinLeaveChannelBtn(feature as never)
        //   .setLabel(t(i, 'EDIT_CHANNEL'))
        //   .setEmoji(emojis.buttons.pencil)
        //   .setStyle('PRIMARY')
        //   .setDisabled(!isEnabled),
        new TestJoinLeaveBtn(feature as never)
          .setLabel(t(i, 'PREVIEW'))
          .setStyle('SECONDARY')
          .setEmoji(emojis.buttons.preview)
          .setDisabled(!isEnabled || errors.length !== 0)
      ),
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
          .setCustomId(`${customId}${feature}`)
          .setDisabled(!isEnabled)
          .setPlaceholder(t(i, 'EDIT_CHANNEL'))
      )
    ),
};

const customId = 'h_edit_';

export const EditChannelSelectMenu = OnEvent('interactionCreate', async (i) => {
  if (i.isChannelSelect()) {
    console.log(i.customId.replace(customId, ''));
  }

  if (
    i.isChannelSelect() &&
    [EditableFeatures.joinMessage, EditableFeatures.leaveMessage].includes(
      i.customId.replace(customId, '') as any
    )
  ) {
    const type = i.customId.replace(customId, '') as EditableFeatures;
    const channel = i.channels.first();

    const propName = type === EditableFeatures.joinMessage ? 'joinChannel' : 'leaveChannel';

    await fetchWithCache(
      `${i.guild.id}:settings`,
      () =>
        prisma.servers.upsert({
          where: { id: i.guild.id },
          update: { [propName]: channel.id },
          create: { id: i.guildId, [propName]: channel.id },
          include,
        }),
      true
    );

    i.update(await renderFeatureSettings.call(i, type));
  }
});

export const EditJoinLeaveMessageBtn = ButtonComponent({
  async handle(type: JoinLeaveData['type']) {
    const data = (await getSettings(this.guild.id))[
      CamelCaseFeatures[type]
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
    const data = (await getSettings(this.guild.id)) as any as RawServerJoin | RawServerLeave;

    await renderJoinLeavePreview.call(this, type, data);
  },
});
