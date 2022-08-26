import { CommandInteraction } from 'discord.js';
import { autocomplete } from 'duck-duck-scrape';
import { ChatCommand, OptionBuilder } from 'purplet';
import { handleDuckDuckGo } from './DuckDuckGo';
import { handleKitsu } from './Kitsu';
import { handleNpm } from './npm';
import { handleRAWG } from './RAWG';
import { handleSpotify } from './Spotify';

export interface SearchCmdOpts {
  site: keyof typeof engines;
  query: string;
  anonymous: boolean;
}

const engines: {
  [k: string]: {
    handle: (this: CommandInteraction, opts: SearchCmdOpts) => void;
    name: string;
  };
} = {
  ddg: {
    handle: handleDuckDuckGo,
    name: '🔎 DuckDuckGo',
  },
  spotify: {
    handle: handleSpotify,
    name: '🎵 Spotify',
  },
  rawg: {
    handle: handleRAWG,
    name: '🎮 RAWG',
  },
  kitsu: {
    handle: handleKitsu,
    name: '🌸 Kitsu',
  },
  npm: {
    handle: handleNpm,
    name: '📦 npm',
  },
};

const choices = Object.entries(engines).reduce(
  (acc, [code, { name }]) => ({
    ...acc,
    [code]: name,
  }),
  {}
);

// console.log(choices);

// export default
ChatCommand({
  name: 'search',
  description:
    'Search for something on the Internet. Powered by DuckDuckGo. More search engines coming soon!',
  options: new OptionBuilder()
    .string('site', 'What search engine to search for.', {
      required: true,
      choices,
    })
    .string('query', 'What to search for.', {
      required: true,
      async autocomplete({ query }) {
        if (query) {
          const res = await autocomplete(query);
          return res.map((r) => ({
            name: r.phrase,
            value: r.phrase,
          }));
        } else {
          return [];
        }
      },
    })
    .boolean('anonymous', 'Whether to show the search results as a public message.'),
  handle(opts) {
    engines[opts.site].handle.call(this, opts as SearchCmdOpts);
  },
});
