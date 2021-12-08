import { colors } from '.';

export const vars = <const>{
  color: `${colors.lightred.toLowerCase()}`,
  language: 'en-US',

  //work related stuff
  job_type: 'unemployed',
  job_xp: 0,
  job_req: 800,
  job_level: 1,
  job_propositions: '',

  //user related misc data
  blocklisted: false,
  lastCmd: '', //export last used cmd
  city: '', //last city entered in ()weather
  hourly_streak: 0,
  helpSuggestions: '',
  todolist: '',

  //economy
  user_bank: 0,
  //  user_guild_bank: 0,

  //inventory
  inventory: {
    banners: [],
    badges: [],
  },

  profile: {
    name: '<user.name>',
    about: 'none',
    banner: '',
    badges: [],
    pronouns: 'unspecified',
    layout: 'basic',
  },
};
