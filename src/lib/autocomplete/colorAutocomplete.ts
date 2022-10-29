import { colors, emojis } from '$lib/env';
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
  private: !(colorNames[key] || hex === colors.sync),
  emoji: emojis.colors[key] || null,
}));

export async function colorAutocomplete(
  this: AutocompleteInteraction,
  color: string,
  includeSync = true,
  includePrivate = false
) {
  color = color.toLowerCase().replace(/ |#/g, '');
  const presetResults = colorsMap
    .filter((colorObj) => (!includePrivate ? !colorObj.private : true))
    .filter((colorObj) =>
      localizedColorNames[this.locale][colorObj.key].toLowerCase().includes(color)
    )
    .filter((colorObj) => (!includeSync ? colorObj.value !== colors.sync : true))
    .map((colorObj) => ({
      name: localizedColorNames[this.locale][colorObj.key],
      value: colorObj.value,
    }));

  return presetResults.length > 0
    ? presetResults
    : /#?[0-9a-f]{6}/i.test(color)
      ? [{ name: `#${color}`, value: color }]
      : [{ name: 'Error: Invalid color', value: 'error' }];
}