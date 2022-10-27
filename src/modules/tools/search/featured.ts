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

  if (featured === 'dictionary') {
    return handleDictionary.call(this, opts);
  }

  if (featured === 'weather') {
    return handleWeather.call(this, opts);
  }

  return handleDuckDuckGo.call(this, opts);
}
