// Imports
const { Bot } = require("aoi.js");
const instance = require("./instance");
const { readFileSync } = require("fs");
require("dotenv").config();

// Configuration files
const { colors, emojis, links, tokens, botinfo, illustrations, logos } =
  JSON.parse(readFileSync("data/config.json", "utf-8"));
const { items } = JSON.parse(readFileSync("data/store.json", "utf-8"));
const { jobs } = JSON.parse(readFileSync("data/jobs.json", "utf-8"));
const { api } = JSON.parse(readFileSync("data/api.json", "utf-8"));

// Creating the bot
const bot = new Bot({
  token: process.env.TOKEN,
  prefix: ["$getServerVar[prefix]"],
  mobile: false, sharding: false, cache: true,
});

// Export the bot, configuration files and instance to be accessed better by commands
module.exports = {
  bot, colors, emojis, jobs, links, tokens, botinfo, items, logos, illustrations, instance, api,
};

// Listeners
bot.onMessage({ guildOnly: false }); // Allow commands to work in DMs
bot.onInteractionCreate(); // For slash commands / interactions
bot.onGuildJoin(); // Send a message when the bot joins a guild
bot.onGuildLeave(); // Deletes some of the guild's variables when CRBT is kicked, to save space in the DB
bot.onMessageDelete(); // Message deleted logs
bot.onMessageUpdate(); // Message edited logs
bot.onJoined(); //For pi's autorole

// Command handler
require("./loadCmds")();

// Start the API
require("./api/api");