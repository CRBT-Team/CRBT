import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import { AutocompleteInteraction } from 'discord.js';
import { Choice } from 'purplet';

dayjs.extend(localizedFormat);

export async function dateAutocomplete(
  this: AutocompleteInteraction,
  date: string
): Promise<Choice<string>[]> {
  const locale = this.locale.split('-')[0];
  await import(`dayjs/locale/${locale}.js`);

  const dateObj = dayjs(date);

  return [
    {
      name: dateObj.format('LL'),
      value: dateObj.format('YYYY-MM-DD'),
    },
  ];
}
