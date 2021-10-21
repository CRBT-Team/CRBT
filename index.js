const { Bot } = require('aoi.js');
require('dotenv').config();

const bot = new Bot({
  token: process.env.DISCORD_TOKEN,
  prefix: '$getServerVar[prefix]',
  mobile: false, sharding: false, cache: true,
  databasePath: './new-database/',
  errorMessage: '{execute:generic}',
  suppressAll: true
});

module.exports.colors = require('./data/config/colors.json');
module.exports.emojis = require('./data/config/emojis.json');
module.exports.illustrations = require('./data/config/illustrations.json');
module.exports.items = require('./data/config/items.json');
module.exports.jobs = require('./data/config/jobs.json');
module.exports.links = require('./data/config/links.json');
module.exports.logos = require('./data/config/logos.json');
module.exports.misc = require('./data/config/misc.json');
module.exports.tokens = require('./data/config/tokens.json');
module.exports.bot = bot;

bot.onMessage({ guildOnly: true });
bot.onGuildJoin();
bot.onGuildLeave();
bot.onMessageDelete();
bot.onMessageUpdate();

require('./loadCmds')();
require('./api/api');