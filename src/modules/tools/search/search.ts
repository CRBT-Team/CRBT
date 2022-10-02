import { CommandInteraction } from 'discord.js';
import { autocomplete as duckduckAutocomplete } from 'duck-duck-scrape';
import { ChatCommand, OptionBuilder } from 'purplet';
import { handleDuckDuckGo } from './DuckDuckGo';
import { handleKitsu } from './Kitsu';
import { handleNpm } from './npm';
import { handleRAWG } from './RAWG';
import { handleSpotify } from './Spotify';

export interface SearchCmdOpts {
  // engine: keyof typeof engines;
  query: string;
  anonymous: boolean;
}

const engines: {
  [k: string]: {
    handle: (this: CommandInteraction, opts: SearchCmdOpts) => void;
    name: string;
  };
} = {
  web: {
    handle: handleDuckDuckGo,
    name: '🔎 DuckDuckGo',
  },
  music: {
    handle: handleSpotify,
    name: '🎵 Spotify',
  },
  rawg: {
    handle: handleRAWG,
    name: '🎮 RAWG',
  },
  anime: {
    handle: handleKitsu,
    name: '🌸 Kitsu',
  },
  // npm: {
  //   handle: handleNpm,
  //   name: '📦 npm',
  // },
};

// const choices = Object.entries(engines).reduce(
//   (acc, [code, { name }]) => ({
//     ...acc,
//     [code]: name,
//   }),
//   {}
// );

// console.log(choices);

// export default
ChatCommand({
  name: 'search',
  description:
    'Search for anything in one of the provided search engines.',
  options: new OptionBuilder()
    // .string('site', 'What search engine to use for your query.', {
    //   required: true,
    //   choices,
    // })
    .string('query', 'What to search for.', {
      required: true,
      async autocomplete({ query }) {
        if (query) {
          const res = await duckduckAutocomplete(query);
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
  async handle(opts) {
    await this.deferReply();

    await this.editReply(await handleDuckDuckGo.call(this, opts as SearchCmdOpts));
  },
});
