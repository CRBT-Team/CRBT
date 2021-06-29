const { emojis, colors } = require("../../../index");

module.exports.command = {
    name: "volume",
    aliases: ["vol"],
    module: "music",
    description_enUS: "Changes the playback volume for the server, or returns volume information if no arguments are given.",
    usage_enUS: "<number>",
    code: `
$if[$message!=]

    $volume[$round[$math[$get[volume]$get[volume]/2]]]

    $setServerVar[volume;$round[$math[$get[volume]$get[volume]/2]]]

    $reply[$messageID;
    {title:Set volume to $round[$get[volume]]%}
    {color:${colors.success}]
    ;no]

    $onlyIf[$voiceID[$clientID]!=;{execute:nomusic}]
    $onlyIf[$voiceID==$voiceID[$clientID];{execute:samevoice}]

    $onlyIf[$round[$get[volume]]<=100;{execute:volumeLimits}]
    $onlyIf[$round[$get[volume]]>=0.1;{execute:volumeLimits}]
    $onlyIf[$round[$get[volume]]!=0;{execute:volumeLimits}]
    $onlyIf[$isNumber[$get[volume]]==true;{execute:args}]
    
    $let[volume;$replaceText[$message[1];%;]]

$else

    $reactionCollector[$botLastMessageID;everyone;10m;${emojis.music.volume},${emojis.music.mute};full,mute;yes]

    $reply[$messageID;
    {title:${emojis.music.volume} Volume is set at $math[$getServerVar[volume]*2]%}
    {description:You can use the reactions below this message to control the volume.}
    {color:$getGlobalUserVar[color]}
    ;no]

$endif

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
    `}