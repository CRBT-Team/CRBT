import { Achievement } from '$lib/responses/Achievements';

export default {
  WELCOME_TO_CRBT: {
    name: 'Welcome to CRBT!',
    howToGet: 'Add CRBT to a server (thanks!).',
    secret: false,
    steps: 1,
    emoji: '1003337586598756563',
  },
  BUG_HUNTER: {
    name: 'Bug Hunter',
    howToGet: 'Report a bug with `/report`.',
    secret: false,
    steps: 1,
    emoji: '1035896477823795240',
  },
  ARTIST: {
    name: 'Self Relooking',
    howToGet: 'Change your accent color using `/color set`.',
    secret: false,
    steps: 1,
    emoji: '1035896475575652452',
  },
  REPAINTING_THE_COMMUNITY: {
    name: "Nice n' Cozy",
    howToGet: "Change the server's accent color with `/settings`.",
    secret: false,
    steps: 1,
  },
  DND_PRO: {
    name: 'DnD Professional',
    howToGet: 'Roll a perfect d20 in `/roll`.',
    secret: false,
    steps: 1,
    emoji: '1035896471230365738',
  },
  BUG_NINJA: {
    name: 'Bug Ninja',
    howToGet: 'Get 5 of your bug reports solved.',
    secret: false,
    steps: 1,
    emoji: '1035896674058510386',
  },
  SEEKER: {
    name: 'Seeker',
    howToGet: 'Search 10 times with `/search`.',
    secret: false,
    steps: 10,
  },
  BOOKMARKER: {
    name: 'Message Afficionado',
    howToGet: 'Bookmark 5 messages.',
    secret: false,
    steps: 5,
  },
  SAFETY_FIRST: {
    name: 'Safety First!',
    howToGet: "Check CRBT's privacy settings with `/privacy`.",
    secret: false,
    steps: 1,
    emoji: '1003351340073885737',
  },
  BREWING_APPS: {
    name: 'Brewing apps',
    howToGet: 'Create and redeem your CRBT API token.',
    secret: true,
    steps: 1,
  },
  CRBT_ADDICT: {
    name: 'CRBT Addict',
    howToGet: 'Use 100 commands.',
    secret: true,
    steps: 1,
    emoji: '1003337596518268938',
  },
  ERROR_MASTER: {
    name: 'On the lookout for more errors!',
    howToGet: 'Find the secret error command.',
    secret: true,
    steps: 1,
    emoji: '1035896473453338695',
  },
  IMITATING_THE_CREATOR: {
    name: 'you impersonatin me?',
    howToGet: 'Find the hidden CRBT accent color.',
    secret: false,
    steps: 1,
    emoji: '1003348080814477333',
  },
} as {
  [k: string]: Achievement;
};