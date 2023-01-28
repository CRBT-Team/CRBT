import { colorsMap } from '$lib/autocomplete/colorAutocomplete';
import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { colors, emojis } from '$lib/env';
import { t } from '$lib/language';
import { EditableFeatures, SettingsMenus } from '$lib/types/settings';
import chroma from 'chroma-js';
import { MessageComponentInteraction, ModalSubmitInteraction } from 'discord.js';
import { components, row, SelectMenuComponent } from 'purplet';
import { ManualColorEditButton } from '../../components/MessageBuilder/ManualColorEditButton';
import { renderFeatureSettings } from './settings';
import { include } from './_helpers';

export const colorSettings: SettingsMenus = {
  getSelectMenu: ({ settings, i }) => ({
    description: t(i, 'SETTINGS_COLOR_SET_TO', {
      color: chroma(settings.accentColor).hex(),
    }),
    emoji: '🎨',
  }),
  getMenuDescription: ({ settings, i }) => ({
    description: t(i, 'SETTINGS_COLOR_DESCRIPTION', {
      color: chroma(settings.accentColor).hex(),
    }),
  }),
  getComponents: ({ i, backBtn, settings }) =>
    components(
      row(
        new ColorPresetSelectMenu().setPlaceholder(t(i, 'COLOR_PRESET_SELECT_MENU')).setOptions(
          colorsMap
            .filter((color) => !color.private && color.value !== 0)
            .map((colorObj) => ({
              label: colorObj.fullName,
              value: colorObj.value.toString(16),
              emoji: colorObj.emoji,
            }))
        )
      ),
      row(
        backBtn,
        new ManualColorEditButton({
          type: EditableFeatures.accentColor,
          value: settings.accentColor ?? colors.default,
        })
          .setLabel(t(i, 'MANUAL_COLOR_EDIT_BUTTON'))
          .setEmoji(emojis.buttons.pencil)
          .setStyle('PRIMARY')
      )
    ),
};

export async function saveColorSettings(
  this: MessageComponentInteraction | ModalSubmitInteraction,
  color: number
) {
  await fetchWithCache(
    `${this.guildId}:settings`,
    () =>
      prisma.servers.update({
        where: { id: this.guild.id },
        data: { accentColor: color },
        include,
      }),
    true
  );

  await this.update(await renderFeatureSettings.call(this, EditableFeatures.accentColor));
}

export const ColorPresetSelectMenu = SelectMenuComponent({
  async handle(ctx: null) {
    const color = parseInt(this.values[0], 16);
    await saveColorSettings.call(this, color);
  },
});
