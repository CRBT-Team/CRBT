import { AutocompleteInteraction } from 'discord.js';
import languages from '../../../data/misc/languages.json';

export async function languagesAutocomplete(this: AutocompleteInteraction, text: string) {
  const filterLangs = Object.entries(languages).filter(
    ([code, name]) =>
      name.toLowerCase().startsWith(text.toLowerCase()) || code.toLowerCase() === text.toLowerCase()
  );
  return filterLangs.map(([code, name]) => ({
    name: `${name}`,
    value: `${code}`,
  }));
}
