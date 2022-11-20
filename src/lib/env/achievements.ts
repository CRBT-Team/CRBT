import { Achievement } from '$lib/responses/Achievements';
import emojis from './emojis';

export default {
  WELCOME_TO_CRBT: {
    secret: false,
    steps: 1,
    emoji: '👋',
  },
  BUG_HUNTER: {
    suggestedCommand: 'report',
    secret: false,
    steps: 1,
    emoji: '🐛',
  },
  ARTIST: {
    suggestedCommand: 'color set',
    secret: false,
    steps: 1,
    emoji: '🖌️',
  },
  REPAINTING_THE_COMMUNITY: {
    suggestedCommand: 'settings',
    secret: false,
    steps: 1,
    emoji: '🎨',
  },
  DND_PRO: {
    suggestedCommand: 'roll',
    secret: false,
    steps: 1,
    emoji: '🎲',
  },
  BUG_NINJA: {
    secret: false,
    steps: 1,
    emoji: '🥷',
  },
  SEEKER: {
    suggestedCommand: 'search',
    secret: false,
    steps: 10,
    emoji: '🔍',
  },
  BOOKMARKER: {
    secret: false,
    steps: 5,
    emoji: '🔖',
  },
  SAFETY_FIRST: {
    suggestedCommand: 'privacy',
    secret: false,
    steps: 1,
    emoji: '🕵️',
  },
  BREWING_APPS: {
    secret: true,
    steps: 1,
    emoji: '🧪',
  },
  CRBT_ADDICT: {
    secret: true,
    steps: 100,
    emoji: '`/`',
  },
  ERROR_MASTER: {
    secret: true,
    steps: 1,
    emoji: emojis.error,
  },
  IMITATING_THE_CREATOR: {
    secret: false,
    steps: 1,
    emoji: '🎭',
  },
} as {
  [k: string]: Achievement;
};
