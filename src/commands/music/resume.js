const { colors, emojis, tokens } = require("../../../index");

module.exports.command = {
    name: "resume",
    module: "music",
    description_enUS: "Resumes the currently playing song.",
    aliases: ["unpause"],
    code: `
$resumeSong

$reply[$messageID;
{title:${emojis.music.play} Resumed playback}
{color:${colors.success}}
;no]

$onlyIf[$voiceID==$voiceID[$clientID];{execute:samevoice}]

$argsCheck[0;{execute:args}]
$onlyIf[$getServerVar[music_channel]==$channelID;{execute:wrongChannel}]
$onlyIf[$queueLength!=0;{execute:nomusic}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}
