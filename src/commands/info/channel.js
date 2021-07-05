module.exports.command = {
    name: "channel",
    aliases: ['channel','ci','channel-info'],
    module: "info",
    description_enUS: "Gives several info on a specified channel, or the current one if no arguments are given.",
    usage_enUS: "<channel ID | channel name | #channel (optional)>",
    code: `
$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]}
{field:$get[id-$getGlobalUserVar[language]]:no}
{field:$get[topic-$getGlobalUserVar[language]]:$replaceText[$replaceText[$checkCondition[$channelTopic==none];true;yes];false;no]}
{field:$get[slowmode-$getGlobalUserVar[language]]:yes}
{field:$get[creationDate-$getGlobalUserVar[language]]:no}
{color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;$channelName[$get[id]] - Channel info:$get[icon]]
$let[topic-enUS;Topic:$replaceText[$replaceText[$checkCondition[$channelTopic==none];true;None];false;$channelTopic]]
$let[id-enUS;ID:$get[id]]
$let[creationDate-enUS;Added:<t:$formatDate[$channel[$get[id];created];X]> (<t:$formatDate[$channel[$get[id];created];X]:R>)]
$let[slowmode-enUS;Slowmode:$replaceText[$replaceText[$checkCondition[$getObjectProperty[slowmode]==];true;None];false;$getObjectProperty[slowmode]]]


$let[icon;
$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[
$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[

$channelType[$get[id]]$channelNSFW[$get[id]]$checkCondition[$get[id]==$guild[$guildID;ruleschannel]]

;textfalsefalse;https://cdn.discordapp.com/emojis/861643749242306610.png]
;texttruefalse;https://cdn.discordapp.com/emojis/861646458544193567.png]

;voiceundefinedfalse;https://cdn.discordapp.com/emojis/861643709111468043.png]

;newsfalsefalse;https://cdn.discordapp.com/emojis/861643588668227635.png]
;newstruefalse;https://cdn.discordapp.com/emojis/861643588668227635.png]

;categoryundefinedfalse;https://cdn.discordapp.com/emojis/861645653326692362.png]

;textfalsetrue;https://cdn.discordapp.com/emojis/861643629563346964.png]
;texttruetrue;https://cdn.discordapp.com/emojis/861643629563346964.png]

;storefalsefalse;https://cdn.discordapp.com/emojis/861643679306743809.png]
;storetruefalse;https://cdn.discordapp.com/emojis/861643679306743809.png]

]

$djsEval[const util = require('dbd.js-utils')
d.object.slowmode = util.parseMS("$get[slow]")]

$let[slow;$getChannelSlowmode[$get[id]]000]

$if[$message==]
    $let[id;$channelID]
$else
    $let[id;$findServerChannel[$message]]
    $onlyIf[$findServerChannel[$message;no]!=undefined;{execute:channelNotFound}]
$endif

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm!=;{execute:guildOnly}]
    `}