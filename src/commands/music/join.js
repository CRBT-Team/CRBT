const { colors, emojis } = require("../../../index");

module.exports.command = {
    name: "join",
    module: "music",
    aliases: ["connect", "plscome"],
    description_enUS: "Connects CRBT to your voice channel.",
    code: `
$joinVC[$voiceID]

$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}

{color:${colors.success}}
;no]

$let[title-enUS;${emojis.general.success} Joined ${emojis.channels.voice} $channelName[$voiceID]]

$if[$voiceID[$clientID]!=]
    $onlyIf[$voiceID[$clientID]==$voiceID;{execute:samevoice}]
$endif

$onlyIf[$voiceID!=;{execute:novoice}]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}