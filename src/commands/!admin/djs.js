module.exports.command = {
    name: "djseval",
    aliases: ["djs", "js"],
    code: `
$djsEval[
const Discord = require("discord.js")
const tools = require("dbd.js-utils")
const emojiUnicode = require("emoji-unicode")
const { Webhook } = require('discord-webhook-node');
const { colors, emojis, jobs, links, tokens, botinfo, items, instance } = require("../../../../../index")
$replaceText[$replaceText[$message;\`\`\`js;];\`\`\`;]]
$addCmdReactions[🏳️]
$onlyForIDs[327690719085068289;$botOwnerID;{execute:owneronly}]
    `}

    // IGNORE THESE
    // message.content.replace("console.log", "channel.send").replace("fconsole.log", "console.log")
    // $replaceText[message;console.log(;channel.send("Console: " + ]
    // message.content = message.content.replace(/console.log/g, "channel.send").replace(/fconsole.log/g, "console.log").trim().split(" ")