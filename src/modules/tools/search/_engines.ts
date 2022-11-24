import {
  CommandInteraction,
  InteractionReplyOptions,
  InteractionUpdateOptions,
  MessageComponentInteraction,
} from 'discord.js';
import { handleDictionary } from './dictionary';
import { handleDuckDuckGo } from './DuckDuckGo';
import { handleAnimeMangas } from './handleAnimeMangas';
import { handleImageSearch } from './images';
// import { handleKitsu } from './Kitsu';
// import { handleMusicSearch } from './music';
import { SearchCmdOpts } from './search';
import { handleUrbanDictionary } from './urban';
import { handleVideosSearch } from './videos';
import { handleWeather } from './weather';

export interface SearchEngine {
  handle: (
    this: CommandInteraction | MessageComponentInteraction,
    opts: SearchCmdOpts
  ) => Promise<InteractionReplyOptions | InteractionUpdateOptions>;
  emoji: string;
  provider: string;
  name: string;
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
    name: 'Web',
  },
  images: {
    handle: handleImageSearch,
    emoji: '🖼️',
    provider: 'Google Images',
    name: 'Images',
  },
  videos: {
    handle: handleVideosSearch,
    emoji: '🎥',
    provider: 'YouTube',
    name: 'Videos',
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
    name: 'Weather',
    hide: true,
    noPagination: true,
  },
  dictionary: {
    handle: handleDictionary,
    emoji: '📖',
    provider: 'Google Dictionary',
    name: 'Dictionary',
    hide: true,
    noPagination: true,
  },
  urban: {
    handle: handleUrbanDictionary,
    emoji: '🧱',
    provider: 'Urban Dictionary',
    name: 'Urban Dictionary',
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
    name: 'Anime & Mangas',
    hide: true,
  },
  // npm: {
  //   handle: handleNpm,
  //   name: '📦 npm',
  // },
};
