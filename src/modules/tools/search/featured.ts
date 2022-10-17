import { CommandInteraction, MessageComponentInteraction } from 'discord.js';
import { englishDictionary } from '../define';
import { handleDictionary } from './dictionary';
import { handleDuckDuckGo } from './DuckDuckGo';
import { SearchCmdOpts } from './search';
import { handleWeather } from './weather';

export async function handleFeaturedSearch(
  this: CommandInteraction | MessageComponentInteraction,
  opts: SearchCmdOpts
) {
  const query = opts.query.toLowerCase();

  console.log(
    query,
    englishDictionary.find((w) => w.toLowerCase() === query)
  );

  if (englishDictionary.find((word) => word === query)) {
    return await handleDictionary.call(this, opts);
  }

  if (query.startsWith('weather')) {
    return await handleWeather.call(this, opts);
  }

  return await handleDuckDuckGo.call(this, opts);
}
