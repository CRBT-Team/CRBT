const { emojis, colors, illustrations } = require("../../../index");

module.exports.command = {
    name: "shuffle",
    module: "music",
    aliases: ["sh"],
    description_enUS: "Shuffles the queue.",
    code: `
$shuffleQueue

$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]:${illustrations.music.shuffle}}
{color:${colors.success}}
;no]

$let[title-enUS;Shuffled queue!]

$argsCheck[0;{execute:args}]
$onlyIf[$getServerVar[music_channel]==$channelID;{execute:wrongChannel}]
$onlyIf[$queueLength!=0;{execute:nomusic}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]

$onlyIf[1==2;{execute:musicDisabled}]
    `}