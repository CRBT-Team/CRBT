import {
  CommandInteraction,
  InteractionReplyOptions,
  InteractionUpdateOptions,
  MessageComponentInteraction,
} from 'discord.js';
import { handleAnimeMangas } from './anime';
import { handleDictionary } from './dictionary';
import { handleImageSearch } from './images';
// import { handleKitsu } from './Kitsu';
// import { handleMusicSearch } from './music';
import { SearchCmdOpts } from './search';
import { handleUrbanDictionary } from './urban';
import { handleVideosSearch } from './videos';
import { handleWeather } from './weather';
import { handleDuckDuckGo } from './web';

export interface SearchEngine {
  handle: (
    this: CommandInteraction | MessageComponentInteraction,
    opts: SearchCmdOpts
  ) => Promise<InteractionReplyOptions | InteractionUpdateOptions>;
  emoji: string;
  provider: string;
  hide?: boolean;
  noPagination?: boolean;
}

export const searchEngines: {
  [k: string]: SearchEngine;
} = {
  web: {
    handle: handleDuckDuckGo,
    emoji: '🔎',
    provider: 'DuckDuckGo',
  },
  images: {
    handle: handleImageSearch,
    emoji: '🖼️',
    provider: 'Google Images',
  },
  videos: {
    handle: handleVideosSearch,
    emoji: '🎥',
    provider: 'YouTube',
  },
  // music: {
  //   handle: handleMusicSearch,
  //   emoji: '🎵',
  //   provider: 'Spotify',
  //   name: 'Music',
  //   hide: true,
  // },
  weather: {
    handle: handleWeather,
    emoji: '☀️',
    provider: 'Open-Meteo.com & OpenStreetMap',
    hide: true,
    noPagination: true,
  },
  dictionary: {
    handle: handleDictionary,
    emoji: '📖',
    provider: 'Google Dictionary',
    hide: true,
    noPagination: true,
  },
  urban: {
    handle: handleUrbanDictionary,
    emoji: '🧱',
    provider: 'Urban Dictionary',
    hide: true,
  },
  // rawg: {
  //   handle: handleRAWG,
  //   name: '🎮 RAWG',
  // },
  anime: {
    handle: handleAnimeMangas,
    emoji: '🌸',
    provider: 'AniList',
    hide: true,
  },
  // npm: {
  //   handle: handleNpm,
  //   name: '📦 npm',
  // },
};
