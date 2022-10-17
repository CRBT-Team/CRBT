import {
  CommandInteraction,
  InteractionReplyOptions,
  InteractionUpdateOptions,
  MessageComponentInteraction,
} from 'discord.js';
import { handleDuckDuckGo } from './DuckDuckGo';
import { handleFeaturedSearch } from './featured';
import { handleImageSearch } from './images';
import { handleKitsu } from './Kitsu';
import { handleMusicSearch } from './music';
import { SearchCmdOpts } from './search';
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
  show: boolean;
}

export const searchEngines: {
  [k: string]: SearchEngine;
} = {
  featured: {
    handle: handleFeaturedSearch,
    emoji: '🌟',
    provider: null,
    name: 'Featured',
    show: true,
  },
  web: {
    handle: handleDuckDuckGo,
    emoji: '🔎',
    provider: 'DuckDuckGo',
    name: 'Web',
    show: true,
  },
  images: {
    handle: handleImageSearch,
    emoji: '🖼️',
    provider: 'DuckDuckGo',
    name: 'Images',
    show: true,
  },
  videos: {
    handle: handleVideosSearch,
    emoji: '🎥',
    provider: 'YouTube',
    name: 'Videos',
    show: true,
  },
  music: {
    handle: handleMusicSearch,
    emoji: '🎵',
    provider: 'Spotify',
    name: 'Music',
    show: false,
  },
  weather: {
    handle: handleWeather,
    emoji: '☀️',
    provider: 'Open-Meteo.com & OpenStreetMap',
    name: 'Weather',
    show: false,
  },
  // rawg: {
  //   handle: handleRAWG,
  //   name: '🎮 RAWG',
  // },
  anime: {
    handle: handleKitsu,
    emoji: '🌸',
    provider: 'Kitsu',
    name: 'Anime & Mangas',
    show: false,
  },
  // npm: {
  //   handle: handleNpm,
  //   name: '📦 npm',
  // },
};
