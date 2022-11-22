import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { colors, emojis, icons } from '$lib/env';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { t } from '$lib/language';
import {
  CamelCaseFeatures,
  EditableFeatures,
  FeatureSettingsProps,
  FullSettings,
  SettingsMenus,
} from '$lib/types/settings';
import { invisibleChar } from '$lib/util/invisibleChar';
import { ServerFlags } from '$lib/util/serverFlags';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import {
  CommandInteraction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from 'discord.js';
import { ButtonComponent, ChatCommand, components, row, SelectMenuComponent } from 'purplet';
import { colorSettings } from './accentColor';
import { economySettings } from './economy';
import { joinLeaveSettings } from './joinLeave';
import { modlogsSettings } from './modlogs';

export const strings = {
  [EditableFeatures.joinMessage]: 'Welcome Message',
  [EditableFeatures.leaveMessage]: 'Farewell Message',
  [EditableFeatures.accentColor]: 'Server Accent Color',
  [EditableFeatures.moderationLogs]: `Moderation Logs`,
  [EditableFeatures.economy]: 'Economy',
};

const features: {
  [k: string]: SettingsMenus;
} = {
  [EditableFeatures.joinMessage]: joinLeaveSettings,
  [EditableFeatures.leaveMessage]: joinLeaveSettings,
  [EditableFeatures.accentColor]: colorSettings,
  [EditableFeatures.moderationLogs]: modlogsSettings,
  [EditableFeatures.economy]: economySettings,
};

const defaultSettings: FullSettings = {
  accentColor: colors.default,
  flags: 0n,
  modules: {
    joinMessage: false,
    leaveMessage: false,
    moderationLogs: false,
  },
};

function resolveSettingsProps(
  i: FeatureSettingsProps['i'],
  feature: EditableFeatures,
  settings: FullSettings
): FeatureSettingsProps {
  const camelCasedKey = CamelCaseFeatures[feature];
  const guild = i.guild;
  const isEnabled = Object.keys(settings.modules).includes(camelCasedKey)
    ? settings.modules[camelCasedKey]
    : settings[camelCasedKey];
  const errors = features[feature].getErrors?.({ feature, guild, isEnabled, settings, i }) || [];

  return {
    feature,
    settings,
    guild,
    errors,
    i,
    isEnabled,
  };
}

export async function getSettings(guildId: string) {
  const data = await fetchWithCache(`${guildId}:settings`, () =>
    prisma.servers.findFirst({ where: { id: guildId }, include: { modules: true } })
  );

  return { ...defaultSettings, ...data };
}

export default ChatCommand({
  name: 'settings',
  description: 'Configure CRBT settings on this server.',
  allowInDMs: false,
  async handle() {
    if (!hasPerms(this.memberPermissions, PermissionFlagsBits.Administrator)) {
      return CRBTError(this, t(this.locale, 'ERROR_ADMIN_ONLY'));
    }

    this.reply(await renderSettingsMenu.call(this));
  },
});

export async function renderSettingsMenu(
  this: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction
) {
  const settings = await getSettings(this.guild.id);

  const options = Object.values(EditableFeatures)
    .map((feature) => {
      if (
        feature === EditableFeatures.economy &&
        (Number(settings.flags) & ServerFlags.HasEconomy) !== ServerFlags.HasEconomy
      )
        return;

      const props = resolveSettingsProps(this, feature, settings);

      return {
        label: strings[feature],
        value: feature,
        ...(props.errors.length > 0
          ? {
              emoji: '⚠️',
              description: 'Attention Required',
            }
          : features[feature].getSelectMenu(props)),
      };
    })
    .filter(Boolean);

  return {
    content: invisibleChar,
    embeds: [
      {
        author: {
          name: `CRBT Settings`,
          iconURL: icons.settings,
        },
        title: `${this.guild.name} / Overview`,
        description: `Use the select menu below to configure a feature.`,
        color: await getColor(this.guild),
      },
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
    const featureId = this.values[0] as EditableFeatures;

    this.update(await renderFeatureSettings.call(this, featureId));
  },
});

export async function renderFeatureSettings(
  this: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction,
  feature: EditableFeatures
): Promise<any> {
  const { getComponents, getMenuDescription } = features[feature];
  const props = resolveSettingsProps(this, feature, await getSettings(this.guildId));
  const { isEnabled, errors } = props;

  const backBtn = new BackSettingsButton(null)
    // .setLabel(t(this, 'SETTINGS'))
    .setEmoji(emojis.buttons.left_arrow)
    .setStyle('SECONDARY');

  const toggleBtn = new ToggleFeatureBtn({ feature, state: !isEnabled })
    .setLabel(`${isEnabled ? 'Disable' : 'Enable'} ${strings[feature]}`)
    // .setEmoji(isEnabled ? emojis.toggle.on : emojis.toggle.off)
    .setStyle(isEnabled ? 'DANGER' : 'SUCCESS');

  const embed = getMenuDescription(props);

  return {
    content: invisibleChar,
    embeds: [
      {
        author: {
          name: 'CRBT Settings',
          icon_url: icons.settings,
        },
        title: `${this.guild.name} / ${strings[feature]}`,
        color: await getColor(this.guild),
        ...embed,
        fields:
          errors.length > 0
            ? [
                {
                  name: `Status • ${errors.length} errors found`,
                  value: errors.map((error) => `⚠️ **${error}**`).join('\n'),
                },
              ]
            : embed.fields,
      },
    ],
    components: getComponents({
      ...props,
      backBtn,
      toggleBtn,
    }),
  };
}

export const BackSettingsButton = ButtonComponent({
  async handle(feature: string | null) {
    if (feature) {
      return this.update(await renderFeatureSettings.call(this, feature as EditableFeatures));
    }
    return this.update(await renderSettingsMenu.call(this));
  },
});

export const ToggleFeatureBtn = ButtonComponent({
  async handle({ feature, state }: { feature: string; state: boolean }) {
    const Feature = CamelCaseFeatures[feature];

    const newState = { [Feature]: state };

    const h = await fetchWithCache(
      `${this.guildId}:settings`,
      async () =>
        prisma.servers.upsert({
          where: { id: this.guildId },
          update: { modules: { upsert: { create: newState, update: newState } } },
          create: {
            id: this.guildId,
            modules: {
              connectOrCreate: { create: newState, where: { id: this.guildId } },
            },
          },
          include: { modules: true },
        }),
      true
    );

    console.log('h', h);

    this.update(await renderFeatureSettings.call(this, feature as EditableFeatures));
  },
});
