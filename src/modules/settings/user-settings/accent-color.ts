import { colorsMap } from '$lib/autocomplete/colorAutocomplete';
import { cache, fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { colors, emojis } from '$lib/env';
import { t } from '$lib/language';
import { EditableUserSettings, UserSettingsMenusProps } from '$lib/types/user-settings';
import chroma from 'chroma-js';
import { ButtonComponent, components, row, SelectMenuComponent } from 'purplet';
import { ManualColorEditButton } from '../../components/MessageBuilder/ManualColorEditButton';
import { userFeatureSettings } from './settings';

export const userAccentColorSettings: UserSettingsMenusProps = {
  description: (l) => t(l, 'color set.strings.EMBED_DESCRIPTION'),
  renderMenuMessage: ({ user, i, accentColor, backBtn }) => {
    return {
      embeds: [
        {
          fields: [
            {
              name: t(i, 'SETTINGS_COLOR_SET_TO'),
              value:
                user.accentColor === 0
                  ? `🔁 ${t(i, 'color set.strings.EMBED_SYNC_INFO')}`
                  : colorsMap.find((c) => c.value === accentColor)
                  ? `${colorsMap.find((c) => c.value === accentColor).emoji} ${t(
                      i,
                      `color set.colorNames.${
                        colorsMap.find((c) => c.value === accentColor).key
                      }` as any
                    )}`
                  : chroma(accentColor).hex(),
            },
          ],
        },
      ],
      components: components(
        row(
          backBtn,
          new SyncToProfileColorBtn()
            .setStyle('SECONDARY')
            .setLabel(
              user.accentColor === 0
                ? t(i, 'color set.strings.EMBED_SYNC_INFO')
                : t(i, 'color set.colorNames.sync')
            )
            .setEmoji(user.accentColor === 0 ? emojis.toggle.on : '')
            .setDisabled(user.accentColor === 0),
          new ManualColorEditButton({
            type: EditableUserSettings.accentColor,
            value: user.accentColor,
          })
            .setLabel(t(i, 'MANUAL_COLOR_EDIT_BUTTON'))
            .setEmoji(emojis.buttons.pencil)
            .setStyle('PRIMARY')
        ),
        row(
          new ColorPresetSelectMenu().setPlaceholder(t(i, 'COLOR_PRESET_SELECT_MENU')).setOptions(
            colorsMap
              .filter(({ value }) => value !== colors.sync)
              .map((colorObj) => ({
                label: t(i, `color set.colorNames.${colorObj.key}` as any),
                value: colorObj.value.toString(),
                emoji: colorObj.emoji,
                default: user.accentColor === colorObj.value,
              }))
          )
        )
      ),
    };
  },
};

export const SyncToProfileColorBtn = ButtonComponent({
  async handle() {
    cache.set(`color:${this.user.id}`, colors.sync);

    await fetchWithCache(
      `user:${this.user.id}`,
      () =>
        prisma.user.upsert({
          create: { id: this.user.id, accentColor: colors.sync },
          update: { accentColor: colors.sync },
          where: { id: this.user.id },
        }),
      true
    );

    this.update(await userFeatureSettings.call(this, EditableUserSettings.accentColor));
  },
});

export const ColorPresetSelectMenu = SelectMenuComponent({
  async handle(ctx: null) {
    const color = parseInt(this.values[0]);

    cache.set(`color:${this.user.id}`, color);

    await fetchWithCache(
      `user:${this.user.id}`,
      () =>
        prisma.user.upsert({
          create: { id: this.user.id, accentColor: color },
          update: { accentColor: color },
          where: { id: this.user.id },
        }),
      true
    );

    this.update(await userFeatureSettings.call(this, EditableUserSettings.accentColor));
  },
});
