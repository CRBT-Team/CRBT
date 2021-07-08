module.exports.command = {
    name: "djseval",
    aliases: ["djs", "js"],
    code: `
$djsEval[
const Discord = require("discord.js")
const tools = require("dbd.js-utils")
const emojiUnicode = require("emoji-unicode")
const { Webhook } = require('discord-webhook-node');
const { colors, emojis, jobs, links, tokens, botinfo, items, instance, illustrations, logos } = require("../../../../../index")
$replaceText[$replaceText[$message;\`\`\`js;];\`\`\`;]]
$addCmdReactions[🏳️]
$onlyForIDs[327690719085068289;$botOwnerID;{execute:owneronly}]
    `}