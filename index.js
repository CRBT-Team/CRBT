// Imports
const { Bot } = require("aoi.js");
const instance = require("./instance");
const { readFileSync, readdirSync, statSync, writeFileSync } = require("fs");
require("dotenv").config();

// Configuration files
const { colors, emojis, links, tokens, botinfo, illustrations } = JSON.parse(
  readFileSync("json/config.jsonc", "utf-8")
);
const { items } = JSON.parse(readFileSync("json/store.jsonc", "utf-8"));
const { jobs } = JSON.parse(readFileSync("json/jobs.jsonc", "utf-8"));

// Export configuration files and instance to be accessed better by commands
module.exports = {
  colors,
  emojis,
  jobs,
  links,
  tokens,
  botinfo,
  items,
  illustrations,
  instance,
};

// Command handler variables
let dir = readdirSync("./src");
let i = 0;

// Creating the bot
const bot = new Bot({
  token: process.env.TOKEN,
  prefix: ["$getServerVar[prefix]", "<@$clientID>", "<@!$clientID>"],
  mobile: false,
  sharding: false,
  cache: true,
});

// Listeners
bot.onMessage({ guildOnly: false }); //so it can work in DMs, too
bot.onUserUpdate(); //to fetch username changes
bot.onInteractionCreate(); //for slash commands and interactions
bot.onGuildJoin() //for the message when the bot joins

// Command handler
handler: while (i < dir.length) {
  console.log(i)
  const stat = statSync("./src/" + dir[i]);

  if (stat.isDirectory()) {
    const readdir = readdirSync("./src/" + dir[i]);

    let nums = 0;
    while (nums < readdir.length) {
      dir.push(dir[i] + "/" + readdir[nums]);
      nums++;
    }
    i++;
    continue handler;
  } else if (stat.isFile()) {
    const command = require("./src/" + dir[i]);
    try {
      bot[Object.keys(command)[0]](command[Object.keys(command)[0]]);
      i++;
      continue handler;
    } catch (err) {
      console.error(err.message);
      delete dir[i];

      continue handler;
    }
  } else {
    console.error("Directory was not a Folder or File");
    delete dir[i];

    continue handler;
  }
}

instance.commandCount = bot.client.bot_commands.size;
// instance.memberCount = bot.client.members.cache.size // These two aren't working
// instance.guildCount = bot.client.guilds.cache.size; // Needs $userCount but idk how to access that outside of a command

// Just took the API code from here, put it in another file and required it so it still runs
require("./api");