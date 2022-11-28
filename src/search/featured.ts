import { CommandInteraction, MessageComponentInteraction } from 'discord.js';
import { englishDictionary } from './dictionary';
import { SearchCmdOpts } from './search';
import { searchEngines } from './_engines';

export function returnFeaturedItem(opts: SearchCmdOpts) {
  const query = opts.query.toLowerCase();
  let item = opts.site;

  if (englishDictionary.find((word) => word === query)) {
    item = 'dictionary';
  }
  if (query.startsWith('weather') && !!query.replace('weather', '').replace('in', '').trim()) {
    item = 'weather';
  }

  return item;
}

export function handleFeaturedSearch(
  this: CommandInteraction | MessageComponentInteraction,
  opts: SearchCmdOpts
) {
  const featured = returnFeaturedItem(opts);

  opts.site = featured ?? 'web';

  return searchEngines[opts.site].handle.call(this, opts);
}
