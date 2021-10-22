const { colors, bot, misc, dev } = require('../..');

module.exports.variables = {
  color: dev ? colors.lightblue.toLowerCase() : colors.lightred.toLowerCase(),
  language: 'enUS',

  job_type: 'unemployed', 
  job_xp: 0, 
  job_req: 800, 
  job_level: 1, 
  job_propositions: '',

  blocklisted: false,
  lastCmd: '', //export last used cmd
  city: '', //last city entered in ()weather
  hourly_streak: 0,
  helpSuggestions: '',
  todolist: '', //for now we're using the old to-do lists since we ain't got time

  user_bank: 0, 
  invbanner: '', 
  invmisc: '', 
  invbadge: '',

  profile_name: '<user.name>',
  profile_about: 'none',
  profile_banner: '',
  profile_badges: '',
  profilePronouns: 'unspecified',
}