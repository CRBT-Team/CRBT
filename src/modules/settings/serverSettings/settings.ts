import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { emojis, icons } from '$lib/env';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { getAllLanguages, t } from '$lib/language';
import { CamelCaseFeatures, EditableFeatures } from '$lib/types/settings';
import { invisibleChar } from '$lib/util/invisibleChar';
import { ServerFlags } from '$lib/util/serverFlags';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import {
  CommandInteraction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from 'discord.js';
import { ButtonComponent, ChatCommand, components, row, SelectMenuComponent } from 'purplet';
import { featureSettingsMenus, getSettings, include, resolveSettingsProps } from './_helpers';

export default ChatCommand({
  name: 'settings',
  description: t('en-US', 'settings.description'),
  nameLocalizations: getAllLanguages('settings.name'),
  descriptionLocalizations: getAllLanguages('settings.description'),
  allowInDMs: false,
  async handle() {
    if (!hasPerms(this.memberPermissions, PermissionFlagsBits.ManageGuild)) {
      return CRBTError(
        this,
        t(this.locale, 'ERROR_MISSING_PERMISSIONS', {
          PERMISSIONS: 'Manage Server',
        })
      );
    }

    await this.deferReply({
      ephemeral: true,
    });

    await this.editReply(await renderSettingsMenu.call(this));
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
        label: t(this, feature),
        value: feature,
        ...(props.errors.length > 0
          ? {
              emoji: '⚠️',
              description: t(this, 'ATTENTION_REQUIRED'),
            }
          : featureSettingsMenus[feature].getSelectMenu(props)),
      };
    })
    .filter(Boolean);

  return {
    content: invisibleChar,
    embeds: [
      {
        author: {
          name: t(this, 'SETTINGS_TITLE'),
          iconURL: icons.settings,
        },
        title: `${this.guild.name} / ${t(this, 'OVERVIEW')}`,
        description: t(this, 'SETTINGS_DESCRIPTION'),
        color: await getColor(this.guild),
      },
    ],
    components: components(
      row(new FeatureSelectMenu().setPlaceholder('Choose a setting.').setOptions(options))
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
  const { getComponents, getMenuDescription } = featureSettingsMenus[feature];
  const props = resolveSettingsProps(this, feature, await getSettings(this.guildId));
  const { isEnabled, errors } = props;

  const backBtn = new BackSettingsButton(null)
    // .setLabel(t(this, 'SETTINGS'))
    .setEmoji(emojis.buttons.left_arrow)
    .setStyle('SECONDARY');

  const toggleBtn = new ToggleFeatureBtn({ feature, state: !isEnabled })
    .setLabel(`${isEnabled ? t(this, 'DISABLE') : t(this, 'ENABLE')} ${t(this, feature)}`)
    // .setEmoji(isEnabled ? emojis.toggle.on : emojis.toggle.off)
    .setStyle(isEnabled ? 'DANGER' : 'SUCCESS');

  const embed = getMenuDescription(props);

  return {
    content: invisibleChar,
    embeds: [
      {
        author: {
          name: t(this, 'SETTINGS_TITLE'),
          icon_url: icons.settings,
        },
        title: `${this.guild.name} / ${t(this, feature)}`,
        color: await getColor(this.guild),
        ...embed,
        fields:
          errors.length > 0
            ? [
                {
                  name: `${t(this, 'STATUS')} • ${t(this, 'SETTINGS_ERRORS_FOUND', {
                    number: errors.length.toLocaleString(this.locale),
                  })}`,
                  value: errors.map((error) => `⚠️ **${error}**`).join('\n'),
                },
              ]
            : embed?.fields,
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
      () =>
        prisma.servers.upsert({
          where: { id: this.guildId },
          update: { modules: { upsert: { create: newState, update: newState } } },
          create: {
            id: this.guildId,
            modules: {
              connectOrCreate: { create: newState, where: { id: this.guildId } },
            },
          },
          include,
        }),
      true
    );

    console.log('h', h);

    this.update(await renderFeatureSettings.call(this, feature as EditableFeatures));
  },
});
