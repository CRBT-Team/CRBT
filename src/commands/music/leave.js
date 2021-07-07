const { colors, emojis } = require("../../../index");

module.exports.command = {
    name: "leave",
    module: "music",
    aliases: ["dc", "disconnect", "stfu"],
    description_enUS: "Makes CRBT quit the current voice channel and clears the queue.",
    code: `
$leaveVC[$voiceID[$clientID]]

$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}

{color:${colors.success}}
;no]

$let[title-enUS;${emojis.general.success} Left #$channelID]

$onlyIf[$voiceID==$voiceID[$clientID];{execute:samevoice}]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}