// Imports
const { Bot } = require("aoi.js");
const { readdirSync } = require('fs-extra')
require("dotenv").config();

// Creating the bot
const bot = new Bot({
    token: process.env.DISCORD_TOKEN,
    prefix: ["$getServerVar[prefix]"],
    mobile: false, sharding: false, cache: true,
    databasePath: "./new-database/",
//    errorMessage: "{execute:generic}",
//    suppressAll: true
});

// Export the bot, configuration files and instance to be accessed better by commands
function config(path) {
    const configFolder = readdirSync(path).filter((file) => file.endsWith(".json"));

    let configs = {};
    for (const file of configFolder) {
    try {
        const config = require(`${path}/${file}`);
        configs[file.split('.')[0]] = config

    } catch (e) {
        return console.log(e);
    }
    }
    return configs;
}
const { colors, emojis, illustrations, jobs, links, logos, misc, items, tokens } = config("./data/config");

module.exports = {
    bot, colors, emojis, illustrations, jobs, links, logos, misc, items, tokens
};

// Listeners
bot.onMessage({ guildOnly: true });
bot.onGuildJoin();
bot.onGuildLeave();
bot.onMessageDelete();
bot.onMessageUpdate();

// Command handler
require("./loadCmds")();

// Start the API
require("./api/api");