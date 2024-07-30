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
    opts: SearchCmdOpts,
  ) => Promise<InteractionReplyOptions | InteractionUpdateOptions>;
  emoji: string;
  provider: string;
  hideButton?: boolean;
  noPagination?: boolean;
}

export const searchEngines: Record<string, SearchEngine> = {
  web: {
    handle: handleDuckDuckGo,
    emoji: '🔎',
    provider: 'DuckDuckGo',
  },
  images: {
    handle: handleImageSearch,
    emoji: '📷',
    provider: 'Google Images',
  },
  videos: {
    handle: handleVideosSearch,
    emoji: '📺',
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
    emoji: '⛅',
    provider: 'Weather',
    hideButton: true,
    noPagination: true,
  },
  dictionary: {
    handle: handleDictionary,
    emoji: '📖',
    provider: 'Google Dictionary',
    hideButton: true,
    noPagination: true,
  },
  urban: {
    handle: handleUrbanDictionary,
    emoji: '🧱',
    provider: 'Urban Dictionary',
    hideButton: true,
  },
  // rawg: {
  //   handle: handleRAWG,
  //   name: '🎮 RAWG',
  // },
  anime: {
    handle: handleAnimeMangas,
    emoji: '🌸',
    provider: 'AniList',
    hideButton: true,
  },
  // npm: {
  //   handle: handleNpm,
  //   name: '📦 npm',
  // },
};
