import { emojis, icons } from '$lib/env';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { getAllLanguages, t } from '$lib/language';
import { CamelCaseGuildFeatures, EditableGuildFeatures } from '$lib/types/guild-settings';
import { invisibleChar } from '$lib/util/invisibleChar';
import { MessageFlags, PermissionFlagsBits } from 'discord-api-types/v10';
import {
  EmbedFieldData,
  Interaction,
  MessageEditOptions,
  MessageSelectOptionData,
} from 'discord.js';
import { ButtonComponent, ChatCommand, SelectMenuComponent, components, row } from 'purplet';
import {
  GuildSettingMenus,
  getGuildSettings,
  resolveSettingsProps,
  saveServerSettings,
} from '../server-settings/_helpers';

export default ChatCommand({
  name: 'server settings',
  description: t('en-US', 'settings.description'),
  descriptionLocalizations: getAllLanguages('settings.description'),
  allowInDMs: false,
  async handle() {
    if (!hasPerms(this.memberPermissions, PermissionFlagsBits.ManageGuild)) {
      return CRBTError(
        this,
        t(this.locale, 'ERROR_MISSING_PERMISSIONS', {
          PERMISSIONS: 'Manage Server',
        }),
      );
    }

    await this.deferReply({
      ephemeral: true,
    });

    await this.editReply(await guildSettingsOverview.call(this));
  },
});

export async function guildSettingsOverview(this: Interaction) {
  const settings = await getGuildSettings(this.guildId);
  const embedFields: EmbedFieldData[] = [];
  const selectMenuOptions: MessageSelectOptionData[] = [];

  GuildSettingMenus.forEach((menu, featureId) => {
    if (menu.mainMenu) return;

    const props = resolveSettingsProps(this, menu, settings);

    let icon = props.errors.length ? '⚠️' : (emojis.features?.[featureId] ?? '');
    let description = props.errors.length
      ? t(this, 'ATTENTION_REQUIRED')
      : menu.description(this.locale);

    embedFields.push({
      name: `${icon} ${t(this, featureId)} ${menu.newLabel ? `\`✨ ${t(this, 'NEW')}\`` : ''}`,
      value: description,
    });

    selectMenuOptions.push({
      label: `${t(this, featureId)} ${menu.newLabel ? `[✨ ${t(this, 'NEW')}]` : ''}`,
      value: featureId,
      emoji: icon,
      description: props.errors.length ? t(this, 'ATTENTION_REQUIRED') : '',
    });
  });

  return {
    content: invisibleChar,
    embeds: [
      {
        author: {
          name: `${this.guild.name} - ${t(this, 'SETTINGS_TITLE')}`,
          iconURL: icons.settings,
        },
        title: t(this, 'OVERVIEW'),
        description: t(this, 'SETTINGS_DESCRIPTION'),
        fields: embedFields,
        thumbnail: { url: this.guild.iconURL() },
        color: await getColor(this.guild),
      },
    ],
    components: components(
      row(
        new FeatureSelectMenu().setPlaceholder(t(this, 'FEATURES')).setOptions(selectMenuOptions),
      ),
    ),
    flags: MessageFlags.Ephemeral,
  };
}

export async function guildFeatureSettings(
  this: Interaction,
  featureId: EditableGuildFeatures,
): Promise<MessageEditOptions> {
  const menu = GuildSettingMenus.get(featureId);
  const settings = await getGuildSettings(this.guildId);
  const props = resolveSettingsProps(this, menu, settings);
  const backBtn = new BackSettingsButton(menu.mainMenu === 'overview' ? null : menu.mainMenu)
    .setEmoji(emojis.buttons.left_arrow)
    .setLabel(menu.mainMenu && menu.mainMenu !== 'overview' ? t(this, menu.mainMenu) : '')
    .setStyle('SECONDARY');
  const message = await menu.renderMenuMessage({ ...props, backBtn });

  return {
    content: invisibleChar,
    components: message.components,
    embeds: [
      {
        author: {
          name: `${this.guild.name} - ${t(this, 'SETTINGS_TITLE')}`,
          icon_url: icons.settings,
        },
        description: menu.description(this.locale),
        title: `${t(this, featureId)} ${menu.newLabel ? `\`✨ ${t(this, 'NEW')}\`` : ''}`,
        color: await getColor(this.guild),
        ...message.embeds[0],
      },
      ...message.embeds.slice(1),
    ],
  };
}

export const BackSettingsButton = ButtonComponent({
  async handle(featureId: string | null) {
    if (featureId) {
      return this.update(await guildFeatureSettings.call(this, featureId as EditableGuildFeatures));
    }
    return this.update(await guildSettingsOverview.call(this));
  },
});

export const FeatureSelectMenu = SelectMenuComponent({
  async handle(ctx: null) {
    const featureId = this.values[0] as EditableGuildFeatures;

    this.update(await guildFeatureSettings.call(this, featureId));
  },
});

export const ToggleFeatureBtn = ButtonComponent({
  async handle({ feature, newState }: { feature: string; newState: boolean }) {
    const Feature = CamelCaseGuildFeatures[feature];

    await saveServerSettings(this.guildId, {
      modules: { [Feature]: newState },
    });

    this.update(await guildFeatureSettings.call(this, feature as EditableGuildFeatures));
  },
});
