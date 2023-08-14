import { colors, emojis } from '$lib/env';
import { t } from '$lib/language';
import chroma from 'chroma-js';
import { AutocompleteInteraction } from 'discord.js';

export const colorsMap = Object.entries(colors)
  .filter(([key, value]) => emojis.colors[key] || value === colors.sync)
  .map(([key, value]) => ({
    key,
    value,
    emoji: emojis.colors[key],
  }));

export async function colorAutocomplete(this: AutocompleteInteraction, color: string) {
  color = color.toLowerCase().replace(/ |#/g, '');

  const presetResults = colorsMap
    .map((colorObj) => ({
      name: t(this, `color set.colorNames.${colorObj.key}` as any) as string,
      value: colorObj.value.toString(),
    }))
    .filter(({ name }) => name.toLowerCase().includes(color));

  return presetResults.length
    ? presetResults
    : chroma.valid(parseInt(color) ?? color)
    ? [
        {
          name: chroma(parseInt(color) ?? color).hex(),
          value: color,
        },
      ]
    : [{ name: t(this, 'ERROR_INVALID_COLOR'), value: 'error' }];
}
