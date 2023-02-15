import { colorsMap } from '$lib/autocomplete/colorAutocomplete';
import emojis, { icon } from '$lib/env/emojis';
import { imgDominantColor } from '$lib/functions/imgDominantColor';
import { t } from '$lib/language';
import { EditableFeatures, SettingsMenus } from '$lib/types/settings';
import chroma from 'chroma-js';
import { ButtonComponent, components, row, SelectMenuComponent } from 'purplet';
import { ManualColorEditButton } from '../../components/MessageBuilder/ManualColorEditButton';
import { renderFeatureSettings } from './settings';
import { saveServerSettings } from './_helpers';

export const themeSettings: SettingsMenus = {
  newLabel: true,
  getSelectMenu: ({ settings, i }) => ({
    description: t(i, 'SETTINGS_COLOR_SET_TO', {
      color: settings.automaticTheming
        ? t(i, 'AUTOMATIC_THEMING')
        : chroma(settings.accentColor).hex(),
    }),
    emoji: '🎨',
  }),
  getMenuDescription: ({ settings, i }) => ({
    description: t(i, 'SETTINGS_COLOR_DESCRIPTION', {
      color: settings.automaticTheming
        ? t(i, 'AUTOMATIC_THEMING')
        : chroma(settings.accentColor).hex(),
    }),
    thumbnail: {
      url: i.guild.iconURL(),
    },
    fields: [
      {
        name: 'Icons preview',
        value: [
          icon(settings.accentColor, 'toggleon'),
          ' ',
          icon(settings.accentColor, 'thumbsup'),
          ' ',
          icon(settings.accentColor, 'thumbsdown'),
          ' ',
          icon(settings.accentColor, 'progressfillstart'),
          icon(settings.accentColor, 'progressfill'),
          icon(settings.accentColor, 'progressfill'),
          icon(settings.accentColor, 'progressfillcut'),
          emojis.progress.empty,
          emojis.progress.emptyend,
        ].join(''),
      },
    ],
  }),
  getComponents: ({ i, backBtn, settings, isEnabled }) =>
    components(
      row(
        backBtn,
        new ToggleAutoThemeBtn(!isEnabled)
          .setStyle('SECONDARY')
          .setLabel(
            `${t(i, 'AUTOMATIC_THEMING')}: ${t(i, settings.automaticTheming ? 'ON' : 'OFF')}`
          ),
        new ManualColorEditButton({
          type: EditableFeatures.automaticTheming,
          value: settings.accentColor,
        })
          .setDisabled(settings.automaticTheming)
          .setLabel(t(i, 'MANUAL_COLOR_EDIT_BUTTON'))
          .setEmoji(emojis.buttons.pencil)
          .setStyle('PRIMARY')
      ),
      row(
        new ColorPresetSelectMenu()
          .setPlaceholder(t(i, 'COLOR_PRESET_SELECT_MENU'))
          .setDisabled(settings.automaticTheming)
          .setOptions(
            colorsMap
              .filter((color) => !color.private && color.value !== 0)
              .map((colorObj) => ({
                label: t(i, `color set.colorNames.${colorObj.key}` as any),
                value: colorObj.value.toString(16),
                emoji: colorObj.emoji,
              }))
          )
      )
    ),
};

export const ToggleAutoThemeBtn = ButtonComponent({
  async handle(newState: any) {
    if (newState) {
      const guildIcon = this.guild.iconURL({ format: 'png' });
      const dominantColor = (await imgDominantColor(guildIcon)).num();

      await saveServerSettings(this.guild.id, {
        automaticTheming: newState,
        iconHash: this.guild.icon,
        accentColor: dominantColor,
      });
    } else {
      await saveServerSettings(this.guildId, {
        automaticTheming: newState,
      });
    }

    this.update(await renderFeatureSettings.call(this, EditableFeatures.automaticTheming));
  },
});

export const ColorPresetSelectMenu = SelectMenuComponent({
  async handle(ctx: null) {
    const color = parseInt(this.values[0], 16);

    await saveServerSettings(this.guildId, {
      accentColor: color,
    });

    this.update(await renderFeatureSettings.call(this, EditableFeatures.automaticTheming));
  },
});
