const webhook_id = "$getChannelVar[webhook_id]";
const webhook_token = "$getChannelVar[webhook_token]";

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
const hook = new Webhook('https://discord.com/api/webhooks/${webhook_id}/${webhook_token}');
const colors = require('../../../../../json/colors.json');
const emojis = require('../../../../../json/emojis.json');
const items = require('../../../../../json/items.json');
const jobs = require('../../../../../json/jobs.json');
const links = require('../../../../../json/links.json');
const tokens = require('../../../../../json/tokens.json');
$replaceText[$replaceText[$replaceText[$message;\`\`\`js;];\`\`\`;];console.log(;channel.send("Console: " + ]]
$addCmdReactions[🏳️]
$onlyForIDs[327690719085068289;{execute:owneronly}]
    `}