const { colors, emojis } = require("../../../index");

module.exports.command = {
    name: "join",
    module: "music",
    aliases: ["connect", "plscome"],
    description_enUS: "Connects CRBT to your voice channel.",
    code: `
$joinVC[$voiceID[$clientID]]

$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}

{color:${colors.success}}
;no]

$let[title-enUS;${emojis.general.success} Join #$channelID]

$onlyIf[$voiceID==$voiceID[$clientID];{execute:samevoice}]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
    `}