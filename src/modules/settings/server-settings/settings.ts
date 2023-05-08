import { emojis } from '$lib/env';
import { icon } from '$lib/env/emojis';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { getAllLanguages, t } from '$lib/language';
import { CamelCaseGuildFeatures, EditableGuildFeatures } from '$lib/types/guild-settings';
import { invisibleChar } from '$lib/util/invisibleChar';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import {
  CommandInteraction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from 'discord.js';
import { ButtonComponent, ChatCommand, components, row, SelectMenuComponent } from 'purplet';
import {
  featureGuildSettingsMenus,
  getGuildSettings,
  getGuildSettingsHeader,
  resolveSettingsProps,
  saveServerSettings,
} from './_helpers';

export default ChatCommand({
  name: 'server settings',
  description: t('en-US', 'settings.description'),
  // nameLocalizations: getAllLanguages('SETTINGS', localeLower),
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

    await this.editReply(await renderGuildSettingsMenu.call(this));
  },
});

export async function renderGuildSettingsMenu(
  this: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction
) {
  const settings = await getGuildSettings(this.guild.id);

  const options = Object.values(EditableGuildFeatures)
    // .filter((feature) =>
    //   feature === EditableGuildFeatures.economy
    //     ? (Number(settings.flags) & ServerFlags.HasEconomy) === ServerFlags.HasEconomy
    //     : true
    // )
    .map((feature) => {
      const props = resolveSettingsProps(this, feature, settings);
      const featureSettings = featureGuildSettingsMenus[feature];

      return {
        label:
          t(this, feature) +
          (featureSettings.newLabel ? ` [${t(this, 'NEW').toLocaleUpperCase(this.locale)}]` : ''),
        value: feature,
        ...(props.errors.length > 0
          ? {
              emoji: '⚠️',
              description: t(this, 'ATTENTION_REQUIRED'),
            }
          : featureSettings.getSelectMenu(props)),
      };
    })
    .filter(Boolean);

  return {
    content: invisibleChar,
    embeds: [
      {
        author: {
          name: `CRBT - ${t(this, 'SETTINGS_TITLE')}`,
          iconURL: icon(settings.accentColor, 'settings', 'image'),
        },
        title: `${this.guild.name} / ${t(this, 'OVERVIEW')}`,
        description: t(this, 'SETTINGS_DESCRIPTION'),
        fields: Object.values(EditableGuildFeatures)
          // .filter((feature) =>
          //   feature === EditableGuildFeatures.economy
          //     ? (Number(settings.flags) & ServerFlags.HasEconomy) === ServerFlags.HasEconomy
          //     : true
          // )
          .map((feature) => {
            const props = resolveSettingsProps(this, feature, settings);
            const featureSettings = featureGuildSettingsMenus[feature];
            let { icon: i, value } = featureSettings.getOverviewValue(props);
            if (props.errors.length) {
              (i = '⚠️'), (value = t(this, 'ATTENTION_REQUIRED'));
            }
            i ??= props.isEnabled ? icon(settings.accentColor, 'toggleon') : emojis.toggle.off;

            return {
              name: `${i} **${t(this, feature)}**`,
              value: value ?? `*${t(this, 'NONE')}*`,
              inline: true,
            };
          }),
        color: await getColor(this.guild),
      },
    ],
    components: components(
      row(new FeatureSelectMenu().setPlaceholder(t(this, 'FEATURES')).setOptions(options))
    ),
    ephemeral: true,
  };
}

export const FeatureSelectMenu = SelectMenuComponent({
  async handle(ctx: null) {
    const featureId = this.values[0] as EditableGuildFeatures;

    this.update(await renderFeatureSettings.call(this, featureId));
  },
});

export async function renderFeatureSettings(
  this: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction,
  feature: EditableGuildFeatures
): Promise<any> {
  const { getComponents, getMenuDescription, newLabel } = featureGuildSettingsMenus[feature];
  const settings = await getGuildSettings(this.guildId);
  const props = resolveSettingsProps(this, feature, settings);
  const { isEnabled, errors } = props;

  const backBtn = new BackSettingsButton(null)
    // .setLabel(t(this, 'SETTINGS'))
    .setEmoji(emojis.buttons.left_arrow)
    .setStyle('SECONDARY');

  const toggleBtn = new ToggleFeatureBtn({ feature, state: !isEnabled })
    .setLabel(isEnabled ? t(this, 'DISABLE_FEATURE') : t(this, 'ENABLE_FEATURE'))
    .setStyle(isEnabled ? 'DANGER' : 'SUCCESS');

  const embed = getMenuDescription(props);

  return {
    content: invisibleChar,
    embeds: [
      {
        ...getGuildSettingsHeader(this.locale, settings.accentColor, [
          this.guild.name,
          `${t(this, feature)} ${
            newLabel ? `[${t(this, 'NEW').toLocaleUpperCase(this.locale)}]` : ''
          }`,
        ]),
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
      return this.update(await renderFeatureSettings.call(this, feature as EditableGuildFeatures));
    }
    return this.update(await renderGuildSettingsMenu.call(this));
  },
});

export const ToggleFeatureBtn = ButtonComponent({
  async handle({ feature, state }: { feature: string; state: boolean }) {
    const Feature = CamelCaseGuildFeatures[feature];
    const newState = { [Feature]: state };

    await saveServerSettings(this.guildId, {
      modules: newState,
    });

    this.update(await renderFeatureSettings.call(this, feature as EditableGuildFeatures));
  },
});