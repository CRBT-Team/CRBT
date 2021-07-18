const { colors, emojis, illustrations } = require("../../../index");

module.exports.command = {
    name: "leave",
    module: "music",
    aliases: ["dc", "disconnect", "stfu", "stop", "tg", "sotp"],
    description_enUS: "Disconnects <botname> from its voice channel and clears the queue.",
    code: `
$leaveVC[$voiceID[$clientID]]

$setServerVar[music_channel;]

$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]:${illustrations.music.stop}}
{description:$get[desc-$getGlobalUserVar[language]]}

{color:${colors.success}}
;no]

$let[title-enUS;See you next time! 👋]
$let[desc-enUS;Disconnected from <#$voiceID> and unbounded from <#$getServerVar[music_channel]>.]

$onlyIf[$voiceID==$voiceID[$clientID];{execute:samevoice}]

$argsCheck[0;{execute:args}]
$onlyIf[$getServerVar[music_channel]==$channelID;{execute:wrongChannel}]
$onlyIf[$voiceID[$clientID]!=;{execute:nomusic}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}