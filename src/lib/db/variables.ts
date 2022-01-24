import { colors } from '.';

export const vars = <const>{
  job: {
    type: 'unemployed',
    xp: 0,
    req: 800,
    level: 1,
    propositions: '',
    hourly_streak: 0,
  },

  blocklist: [],
  todolist: [],

  inventory: {
    banners: [],
    badges: [],
  },

  color: colors.lightred.toLowerCase(),

  profile: {
    name: '<user.name>',
    about: null,
    banner: '',
    badges: [],
    pronouns: 'unspecified',
    purplets: 0,
  },
};
