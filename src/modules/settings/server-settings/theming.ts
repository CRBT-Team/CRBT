import { colorsMap } from '$lib/autocomplete/colorAutocomplete';
import { colors, emojis } from '$lib/env';
import { imgDominantColor } from '$lib/functions/imgDominantColor';
import { t } from '$lib/language';
import { EditableGuildFeatures, SettingsMenuProps } from '$lib/types/guild-settings';
import chroma from 'chroma-js';
import { ButtonComponent, SelectMenuComponent, components, row } from 'purplet';
import { ManualColorEditButton } from '../../components/MessageBuilder/ManualColorEditButton';
import { saveServerSettings } from './_helpers';
import { guildFeatureSettings } from './settings';

export const themeSettings: SettingsMenuProps = {
  description: (l) => t(l, 'SETTINGS_COLOR_SHORT_DESCRIPTION'),
  renderMenuMessage: ({ settings, i, guild, backBtn }) => {
    settings.isAutoThemingEnabled = guild.icon ? settings.isAutoThemingEnabled : false;

    console.log(guild.icon);

    return {
      embeds: [
        {
          description: t(i, 'SETTINGS_COLOR_DESCRIPTION'),
          fields: [
            {
              name: t(i, 'SETTINGS_COLOR_SET_TO'),
              value: settings.isAutoThemingEnabled
                ? `🔁 ${t(i, 'AUTO')}`
                : colorsMap.find((c) => c.value === settings.accentColor)
                ? `${colorsMap.find((c) => c.value === settings.accentColor).emoji} ${t(
                    i,
                    `color set.colorNames.${
                      colorsMap.find((c) => c.value === settings.accentColor).key
                    }` as any,
                  )}`
                : chroma(settings.accentColor).hex(),
            },
          ],
          thumbnail: {
            url: i.guild.iconURL(),
          },
        },
      ],
      components: components(
        row(
          backBtn,
          new ToggleAutoThemeBtn(!settings.isAutoThemingEnabled)
            .setStyle('SECONDARY')
            .setEmoji(settings.isAutoThemingEnabled ? emojis.toggle.on : emojis.toggle.off)
            .setLabel(t(i, 'AUTOMATIC_THEMING'))
            .setDisabled(!guild.icon || settings.isAutoThemingEnabled),
          new ManualColorEditButton({
            type: EditableGuildFeatures.automaticTheming,
            value: settings.accentColor,
          })
            .setLabel(t(i, 'MANUAL_COLOR_EDIT_BUTTON'))
            .setEmoji(emojis.buttons.pencil)
            .setStyle('PRIMARY'),
        ),
        row(
          new ColorPresetSelectMenu().setPlaceholder(t(i, 'COLOR_PRESET_SELECT_MENU')).setOptions(
            colorsMap
              .filter(({ value }) => value !== colors.sync)
              .map((colorObj) => ({
                label: t(i, `color set.colorNames.${colorObj.key}` as any),
                value: colorObj.value.toString(),
                emoji: colorObj.emoji,
                default: settings.accentColor === colorObj.value,
              })),
          ),
        ),
      ),
    };
  },
};

export const ToggleAutoThemeBtn = ButtonComponent({
  async handle(newState: any) {
    if (newState) {
      const guildIcon = this.guild.iconURL({ format: 'png' });
      const dominantColor = (await imgDominantColor(guildIcon)).num();

      await saveServerSettings(this.guild.id, {
        isAutoThemingEnabled: newState,
        iconHash: this.guild.icon,
        accentColor: dominantColor,
      });
    } else {
      await saveServerSettings(this.guildId, {
        isAutoThemingEnabled: newState,
      });
    }

    this.update(await guildFeatureSettings.call(this, EditableGuildFeatures.automaticTheming));
  },
});

export const ColorPresetSelectMenu = SelectMenuComponent({
  async handle(ctx: null) {
    const color = parseInt(this.values[0]);

    await saveServerSettings(this.guildId, {
      accentColor: color,
      isAutoThemingEnabled: false,
    });

    this.update(await guildFeatureSettings.call(this, EditableGuildFeatures.automaticTheming));
  },
});
