module.exports.command = {
    name: "djseval",
    aliases: ["djs", "js"],
    code: `
$djsEval[
const Discord = require("discord.js")
const tools = require("dbd.js-utils")
const emojiUnicode = require("emoji-unicode")
const webhook_id = "$getChannelVar[webhook_id]"
const webhook_token = "$getChannelVar[webhook_token]"
const { Webhook } = require('discord-webhook-node');
const hook = new Webhook('https://discord.com/api/webhooks/' + webhook_id + webhook_token);
const { colors, emojis, jobs, links, tokens, botinfo, items, instance } = require("../../../../../index")
$replaceText[$replaceText[$replaceText[$message;\`\`\`js;];\`\`\`;];console.log(;channel.send("Console: " + ]]
$addCmdReactions[🏳️]
$onlyForIDs[327690719085068289;$botOwnerID;{execute:owneronly}]
    `}