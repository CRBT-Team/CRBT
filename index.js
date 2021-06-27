// Imports
const { Bot } = require("aoi.js");
const instance = require("./instance");
const { readFileSync } = require("fs");
require("dotenv").config();

// Configuration files
const { colors, emojis, links, tokens, botinfo, illustrations, logos } =
  JSON.parse(readFileSync("json/config.json", "utf-8"));
const { items } = JSON.parse(readFileSync("json/store.json", "utf-8"));
const { jobs } = JSON.parse(readFileSync("json/jobs.json", "utf-8"));
const { api } = JSON.parse(readFileSync("json/api.json", "utf-8"));

// Creating the bot
const bot = new Bot({
  token: process.env.TOKEN,
  prefix: ["$getServerVar[prefix]", "<@$clientID>", "<@!$clientID>"],
  mobile: false,
  sharding: false,
  cache: true,
});

// Export the bot, configuration files and instance to be accessed better by commands
module.exports = {
  bot,
  colors,
  emojis,
  jobs,
  links,
  tokens,
  botinfo,
  items,
  logos,
  illustrations,
  instance,
  api,
};

// Listeners
bot.onMessage({ guildOnly: false }); // Allow commands to work in DMs
bot.onUserUpdate(); // Fetch username changes
bot.onInteractionCreate(); // For slash commands / interactions
bot.onGuildJoin(); // Send a message when the bot joins a guild

// Command handler
require("./loadCmds")();

// Start the API
require("./api/api");
