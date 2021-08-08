const { colors, emojis } = require("../../../index")

module.exports.command = {
    name: "eval",
    aliases: ["e"],
    module: "admin",
    error: `$createFile[$error;error.log] $reply[$messageID;{title:${emojis.error} An error occured} {color:${colors.red}};no] $addCmdReactions[❌]`,
    code: `
$addCmdReactions[🏳️]
$eval[$message]
$onlyForIDs[327690719085068289;$botOwnerID;{execute:owneronly}]
    `}