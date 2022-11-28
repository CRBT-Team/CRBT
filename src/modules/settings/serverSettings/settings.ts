import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { emojis, icons } from '$lib/env';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { t } from '$lib/language';
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
import {
  featureSettingsMenus,
  getSettings,
  include,
  resolveSettingsProps,
  strings,
} from './_helpers';

export default ChatCommand({
  name: 'settings',
  description: 'Configure CRBT settings on this server.',
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
          : featureSettingsMenus[feature].getSelectMenu(props)),
      };
    })
    .filter(Boolean);

  return {
    content: invisibleChar,
    embeds: [
      {
        author: {
          name: `CRBT Server Settings`,
          iconURL: icons.settings,
        },
        title: `${this.guild.name} / Overview`,
        description: `Use the select menu below to update the settings for this server.`,
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
