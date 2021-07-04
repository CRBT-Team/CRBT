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
bot.onMessageDelete(); // For the message deletion thing
bot.onMessageUpdate();
/*
bot.command({
    name: "rps",
    code: `
$apiMessage[;{title:Testing interactions}
{color:$getGlobalUserVar[color]}
{description:click a button to do a thing!}
{thumbnail:$authorAvatar}
;{actionRow:Ephemeral message,2,1,ephemeral,:Thing,2,3,editmsg,:Reply message,2,4,replymsg,};$messageID;no;no]
    `})

bot.interactionCommand({
    name: "ephemeral",
    prototype: "button",
    code: `
$interactionReply[<@!$authorID>;;;64]
    `})

bot.interactionCommand({
    name: "editmsg",
    prototype: "button",
    code: `
$interactionEdit[;{title:yoo}]
$interactionReply[hello]
    `})

bot.interactionCommand({
    name: "replymsg",
    prototype: "button",
    code: `
$interactionReply[<@!$authorID>;;{actionRow:Ephemeral message,2,1,ephemeral,:Edit message,2,2,editmsg,:Reply message,2,3,replymsg,}]
    `})
*/
/* Lavalink
bot.createLavalink("127.0.0.1:2333", "crbt_rewrite", false);
*/

// Command handler
require("./loadCmds")();

// Start the API
require("./api/api");