import { colorsMap } from '$lib/autocomplete/colorAutocomplete';
import { cache } from '$lib/cache';
import { prisma } from '$lib/db';
import { colors, emojis } from '$lib/env';
import { t } from '$lib/language';
import { EditableFeatures, SettingsMenus } from '$lib/types/settings';
import { MessageComponentInteraction, ModalSubmitInteraction } from 'discord.js';
import { components, row, SelectMenuComponent } from 'purplet';
import { ManualColorEditButton } from '../../components/MessageBuilder/ManualColorEditButton';
import { getSettings, renderFeatureSettings, strings } from './settings';

export const colorSettings: SettingsMenus = {
  getSelectMenu: ({ settings }) => ({
    label: strings.ACCENT_COLOR,
    value: EditableFeatures.accentColor,
    description: `Set to #${(settings.accentColor ?? colors.default).toString(16)}`,
    emoji: '🎨',
  }),
  getMenuDescription: ({ settings }) => ({
    description: `The server's accent color is currently shown on the side of this message, and will be shown on new Polls, Giveaways, Role Pickers, the Server Info sheet, and more.\nIt is set to **#${(
      settings.accentColor ?? colors.default
    ).toString(16)}**.\nTo edit it, use one of the below presets or manually pick a new HEX color.`,
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
  const settings = await getSettings(this.guild.id);
  settings.accentColor = color;
  await prisma.servers.update({
    where: { id: this.guild.id },
    data: { accentColor: color },
  });
  cache.set(`${this.guildId}:color`, color);
  cache.set(`${this.guildId}:settings`, settings);
  await this.update(await renderFeatureSettings.call(this, EditableFeatures.accentColor));
}

export const ColorPresetSelectMenu = SelectMenuComponent({
  async handle(ctx: null) {
    const color = parseInt(this.values[0], 16);
    await saveColorSettings.call(this, color);
  },
});
