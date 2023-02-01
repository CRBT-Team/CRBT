import { upperCaseFirst } from 'change-case-all';
import { AutocompleteInteraction } from 'discord.js';
import languages from '../../../static/misc/langs.json';

export function languagesAutocomplete(this: AutocompleteInteraction, text: string) {
  const intl = new Intl.DisplayNames(this.locale, {
    type: 'language',
    fallback: 'code',
    style: 'long',
    languageDisplay: 'standard',
  });

  const languageNames = languages.all.map((code) => ({
    name: upperCaseFirst(intl.of(code)),
    value: code,
  }));

  return languageNames.filter(
    ({ name, value }) =>
      name.toLowerCase().startsWith(text.toLowerCase()) ||
      value.toLowerCase() === text.toLowerCase()
  );
}
