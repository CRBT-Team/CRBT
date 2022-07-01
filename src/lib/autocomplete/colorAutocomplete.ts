import { colors, emojis } from '$lib/db';
import { languages, t } from '$lib/language';
import { AutocompleteInteraction } from 'discord.js';

const { colorNames } = t('en-US', 'color set');

export const localizedColorNames = Object.keys(languages).reduce((acc, lang) => {
  const strings = t(lang, 'color set');
  return {
    ...acc,
    [lang]: strings.colorNames,
  };
}, {});

export const colorsMap = Object.entries(colors).map(([key, hex]) => ({
  key,
  fullName: colorNames[key],
  value: hex,
  private: !(colorNames[key] || hex === 'profile'),
  emoji: emojis.colors[key] || null,
}));

export async function colorAutocomplete(
  this: AutocompleteInteraction,
  color: string,
  includeSync = true,
  includePrivate = false
) {
  return colorsMap
    .filter((colorObj) => (!includePrivate ? !colorObj.private : true))
    .filter((colorObj) =>
      localizedColorNames[this.locale][colorObj.key].toLowerCase().includes(color.toLowerCase())
    )
    .filter((colorObj) => (!includeSync ? colorObj.key !== 'sync' : true))
    .map((colorObj) => ({
      name: localizedColorNames[this.locale][colorObj.key],
      value: colorObj.value,
    }));
}
