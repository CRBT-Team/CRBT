import { colorsMap } from '$lib/autocomplete/colorAutocomplete';
import { cache } from '$lib/cache';
import { colors, db, emojis, icons } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { t } from '$lib/language';
import { JoinLeaveData, MessageBuilderTypes } from '$lib/types/messageBuilder';
import { invisibleChar } from '$lib/util/invisibleChar';
import { SnowflakeRegex } from '$lib/util/regex';
import { serverModules, servers } from '@prisma/client';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import {
  Channel,
  CommandInteraction,
  Guild,
  MessageComponentInteraction,
  MessageEmbed,
  ModalSubmitInteraction,
  TextInputComponent,
} from 'discord.js';
import {
  ButtonComponent,
  ChatCommand,
  components,
  ModalComponent,
  row,
  SelectMenuComponent,
} from 'purplet';
import { MessageBuilder } from '../components/MessageBuilder';
import { ManualColorEditButton } from '../components/MessageBuilder/ManualColorEditButton';
import { RawServerJoin, RawServerLeave, resolveMsgType } from '../joinLeave/types';

export enum EditableFeatures {
  accentColor = 'ACCENT_COLOR',
  joinMessage = 'JOIN_MESSAGE',
  leaveMessage = 'LEAVE_MESSAGE',
  suggestions = 'SUGGESTIONS',
}

export type FullSettings = servers & { modules: serverModules };

const strings = {
  ACCENT_COLOR: 'Server Accent Color',
  JOIN_MESSAGE: 'Welcome Message',
  LEAVE_MESSAGE: 'Farewell Message',
  SUGGESTIONS: 'Suggestions',
};

async function getSettings(guildId: string) {
  const settings =
    cache.get<FullSettings>(`${guildId}:settings`) ??
    (await db.servers.findFirst({ where: { id: guildId }, include: { modules: true } }));
  return settings;
}

export default ChatCommand({
  name: 'settings',
  description: 'Configure CRBT settings on this server.',
  allowInDMs: false,
  async handle() {
    if (!hasPerms(this.memberPermissions, PermissionFlagsBits.Administrator)) {
      return this.reply(CRBTError(t(this.locale, 'ERROR_ADMIN_ONLY')));
    }

    this.reply(await renderSettingsMenu.call(this));
  },
});

async function renderSettingsMenu(
  this: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction
) {
  const settings = await getSettings(this.guild.id);

  const options = [
    {
      label: strings.ACCENT_COLOR,
      value: EditableFeatures.accentColor,
      description: `Set to ${settings.accentColor ?? `#${colors.default}`}`,
      emoji: '🎨',
    },
    ...Object.entries(EditableFeatures).map(([key, snake_key]) => {
      if (!Object.keys(settings.modules).includes(key)) return;
      let description;
      switch (snake_key) {
        case EditableFeatures.joinMessage:
        case EditableFeatures.leaveMessage:
          {
            const channelId =
              snake_key === EditableFeatures.joinMessage
                ? settings.joinChannel
                : settings.leaveChannel;
            const channel = this.guild.channels.cache.find((c) => c.id === channelId);

            description = `Sending in ${channel ? `#${channel.name}` : '[Channel Deleted]'}`;
          }
          break;
      }
      return {
        label: strings[snake_key],
        emoji: emojis.toggle[settings.modules[key] ? 'on' : 'off'],
        description,
        value: snake_key,
      };
    }),
  ].filter(Boolean);

  return {
    content: invisibleChar,
    embeds: [
      new MessageEmbed()
        .setAuthor({
          name: `${this.guild.name} - CRBT Settings`,
          iconURL: icons.settings,
        })
        .setDescription(`Use the select menu below to configure a feature.`)
        .setColor(await getColor(this.guild)),
    ],
    components: components(
      row(
        new FeatureSelectMenu().setPlaceholder('Select a feature to configure.').setOptions(options)
      )
    ),
    ephemeral: true,
  };
}

export const FeatureSelectMenu = SelectMenuComponent({
  async handle(ctx: null) {
    const featureId = this.values[0];
    this.update(await renderFeatureSettings.call(this, featureId));
  },
});

export const ColorPresetSelectMenu = SelectMenuComponent({
  async handle(ctx: null) {
    const color = this.values[0];
    await saveColorSettings.call(this, color.toLowerCase());
  },
});

export async function saveColorSettings(
  this: MessageComponentInteraction | ModalSubmitInteraction,
  color: string
) {
  color = `#${color}`;
  const settings = await getSettings(this.guild.id);
  settings.accentColor = color;
  await db.servers.update({
    where: { id: this.guild.id },
    data: { accentColor: color },
  });
  cache.set(`${this.guildId}:color`, color);
  cache.set(`${this.guildId}:settings`, settings);
  await this.update(await renderFeatureSettings.call(this, EditableFeatures.accentColor));
}

async function renderFeatureSettings(
  this: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction,
  feature: string
) {
  const [key, snake_key] = Object.entries(EditableFeatures).find(([_, value]) => value === feature);
  const settings = await getSettings(this.guild.id);
  const isModule = Object.keys(settings.modules).includes(key);
  const isEnabled = isModule ? settings.modules[key] : settings[key];

  const components = getComponentsForFeature(snake_key, this.locale, isEnabled);

  return {
    content: invisibleChar,
    embeds: [
      new MessageEmbed(getDescriptionForFeature(snake_key, this.locale, settings, this.guild))
        .setAuthor({
          name: `${this.guild.name} - ${strings[snake_key]} Settings`,
          iconURL: icons.settings,
        })
        .setColor(await getColor(this.guild)),
    ],
    components,
  };
}

export const BackSettingsButton = ButtonComponent({
  async handle(feature?: string) {
    if (feature) {
      return this.update(await renderFeatureSettings.call(this, feature));
    }
    return this.update(await renderSettingsMenu.call(this));
  },
});

function getDescriptionForFeature(
  feature: EditableFeatures,
  locale: string,
  settings: FullSettings,
  guild: Guild
) {
  switch (feature) {
    case EditableFeatures.joinMessage:
    case EditableFeatures.leaveMessage: {
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
          `\nUse the buttons below to configure the feature or to ${
            isEnabled ? 'enable' : 'disable'
          } it.`,
      };
    }
    case EditableFeatures.accentColor: {
      return {
        description: `The server's accent color is currently shown on the side of this message, and will be shown on new Polls, Giveaways, Role Pickers, the Server Info sheet, and more.\nIt is set to **${
          settings.accentColor ?? `#${colors.default}`
        }**.\nTo edit it, use one of the below presets or manually pick a new HEX color.`,
      };
    }
    default:
      return {
        description: `Use the buttons below to configure this feature.`,
      };
  }
}

function getComponentsForFeature(feature: string, locale: string, value?: boolean | string) {
  const BackBtn = new BackSettingsButton()
    .setLabel(t(locale, 'SETTINGS'))
    .setEmoji(emojis.buttons.left_arrow)
    .setStyle('SECONDARY');
  const ToggleBtn = new ToggleFeatureBtn({ feature, state: !value })
    .setLabel(value ? 'Enabled' : 'Disabled')
    .setEmoji(value ? emojis.toggle.on : emojis.toggle.off)
    .setStyle('SECONDARY');

  switch (feature) {
    case EditableFeatures.accentColor: {
      return components(
        row(
          new ColorPresetSelectMenu()
            .setPlaceholder(t(locale, 'COLOR_PRESET_SELECT_MENU'))
            .setOptions(
              colorsMap
                .filter((color) => !color.private && color.value !== 'profile')
                .map((colorObj) => ({
                  label: colorObj.fullName,
                  value: colorObj.value,
                  emoji: colorObj.emoji,
                }))
            )
        ),
        row(
          BackBtn,
          new ManualColorEditButton({ type: EditableFeatures.accentColor, value: value as string })
            .setLabel(t(locale, 'MANUAL_COLOR_EDIT_BUTTON'))
            .setEmoji(emojis.buttons.pencil)
            .setStyle('PRIMARY')
        )
      );
    }
    case EditableFeatures.joinMessage:
    case EditableFeatures.leaveMessage: {
      return components(
        row(BackBtn, ToggleBtn),
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
      );
    }
  }
}

export const ToggleFeatureBtn = ButtonComponent({
  async handle({ feature, state }: { feature: string; state: boolean }) {
    const settings = await getSettings(this.guild.id);
    const [key] = Object.entries(EditableFeatures).find(([_, value]) => value === feature);

    settings.modules[key] = state;
    cache.set(`${this.guild.id}:settings`, settings);
    await db.serverModules.update({
      where: { id: this.guild.id },
      data: { [key]: settings.modules[key] },
    });

    this.update(await renderFeatureSettings.call(this, feature));
  },
});

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
        return this.reply(CRBTError('This channel does not exist or is not a text channel.'));
      }
    } else {
      channel = this.guild.channels.cache.find((c) => c.name === channelInput);
      if (!channel || channel.type !== 'GUILD_TEXT') {
        return this.reply(CRBTError('This channel does not exist or is not a text channel.'));
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
