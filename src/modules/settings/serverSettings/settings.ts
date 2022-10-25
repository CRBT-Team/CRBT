import { cache } from '$lib/cache';
import { prisma } from '$lib/db';
import { emojis, icons } from '$lib/env';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { t } from '$lib/language';
import { EditableFeatures, FullSettings, SettingsMenus } from '$lib/types/settings';
import { invisibleChar } from '$lib/util/invisibleChar';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import {
  CommandInteraction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from 'discord.js';
import { ButtonComponent, ChatCommand, components, row, SelectMenuComponent } from 'purplet';
import { colorSettings } from './accentColor';
import { joinLeaveSettings } from './joinLeave';

export const strings = {
  ACCENT_COLOR: 'Server Accent Color',
  JOIN_MESSAGE: 'Welcome Message',
  LEAVE_MESSAGE: 'Farewell Message',
};

const features: {
  [k: string]: SettingsMenus;
} = {
  [EditableFeatures.joinMessage]: joinLeaveSettings,
  [EditableFeatures.leaveMessage]: joinLeaveSettings,
  [EditableFeatures.accentColor]: colorSettings,
};

export async function getSettings(guildId: string) {
  const settings =
    cache.get<FullSettings>(`${guildId}:settings`) ??
    (await prisma.servers.findFirst({ where: { id: guildId }, include: { modules: true } }));
  return settings;
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

  const options = Object.entries(EditableFeatures)
    .map(([key, snake_key]) => {
      return features[snake_key].getSelectMenu({
        i: this,
        feature: snake_key,
        guild: this.guild,
        settings,
      });
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
    const featureId = this.values[0];
    this.update(await renderFeatureSettings.call(this, featureId));
  },
});

export async function renderFeatureSettings(
  this: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction,
  feature: string
) {
  const [key, snake_key] = Object.entries(EditableFeatures).find(([_, value]) => value === feature);
  const settings = await getSettings(this.guild.id);
  const isModule = Object.keys(settings.modules).includes(key);
  const isEnabled = isModule ? settings.modules[key] : settings[key];

  const backBtn = new BackSettingsButton()
    .setLabel(t(this, 'SETTINGS'))
    .setEmoji(emojis.buttons.left_arrow)
    .setStyle('SECONDARY');
  const toggleBtn = new ToggleFeatureBtn({ feature, state: !isEnabled })
    .setLabel(isEnabled ? 'Enabled' : 'Disabled')
    .setEmoji(isEnabled ? emojis.toggle.on : emojis.toggle.off)
    .setStyle('SECONDARY');

  const components = features[feature].getComponents({
    backBtn,
    toggleBtn,
    feature: snake_key,
    guild: this.guild,
    i: this,
    settings,
  });
  const embed = features[feature].getMenuDescription({
    feature: snake_key,
    i: this,
    guild: this.guild,
    settings,
  });

  return {
    content: invisibleChar,
    embeds: [
      {
        ...embed,
        title: `${this.guild.name} / ${strings[snake_key]}`,
        author: {
          name: 'CRBT Settings',
          iconURL: icons.settings,
        },
        color: await getColor(this.guild),
      },
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

export const ToggleFeatureBtn = ButtonComponent({
  async handle({ feature, state }: { feature: string; state: boolean }) {
    const settings = await getSettings(this.guild.id);
    const [key] = Object.entries(EditableFeatures).find(([_, value]) => value === feature);

    settings.modules[key] = state;
    cache.set(`${this.guild.id}:settings`, settings);
    await prisma.serverModules.update({
      where: { id: this.guild.id },
      data: { [key]: settings.modules[key] },
    });

    this.update(await renderFeatureSettings.call(this, feature));
  },
});
