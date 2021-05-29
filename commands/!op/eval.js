const colors = require('../../json/colors.json');
const emojis = require('../../json/emojis.json');

module.exports.command = {
    name: "eval",
    aliases: ["e"],
    code: `
$addCmdReactions[🏳️]
$eval[$message]
$onlyForIDs[327690719085068289;{execute:owneronly}]
    `}