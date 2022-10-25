import { CommandInteraction, MessageComponentInteraction } from 'discord.js';
import { englishDictionary } from '../define';
import { handleDictionary } from './dictionary';
import { handleDuckDuckGo } from './DuckDuckGo';
import { SearchCmdOpts } from './search';
import { handleWeather } from './weather';

export function returnFeaturedItem(opts: SearchCmdOpts) {
  const query = opts.query.toLowerCase();
  let item = opts.site;

  if (englishDictionary.find((word) => word === query)) {
    item = 'dictionary';
  }
  if (query.startsWith('weather')) {
    item = 'weather';
  }

  return item;
}

export function handleFeaturedSearch(
  this: CommandInteraction | MessageComponentInteraction,
  opts: SearchCmdOpts
) {
  const featured = returnFeaturedItem(opts);

  if (featured === 'dictionary') {
    return handleDictionary.call(this, { ...opts, site: 'dictionary' });
  }

  if (featured === 'weather') {
    return handleWeather.call(this, { ...opts, site: 'weather' });
  }

  return handleDuckDuckGo.call(this, { ...opts, site: 'web' });
}
