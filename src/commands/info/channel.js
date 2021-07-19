const {illustrations} = require("../../../index");
const c = illustrations.channels

module.exports.command = {
    name: "channel",
    aliases: ['channelinfo','ci','channel-info', 'channel_info'],
    module: "info",
    description_enUS: "Gives several info on a specified channel, or the current one if no arguments are given.",
    usage_enUS: "<channel ID | channel name | #channel (optional)>",
    code: `
$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]}
{field:$get[id-$getGlobalUserVar[language]]:no}
{field:$get[topic-$getGlobalUserVar[language]]:$replaceText[$replaceText[$checkCondition[$channelTopic[$get[id]]==none];true;yes];false;no]}
{field:$get[slowmode-$getGlobalUserVar[language]]:yes}
{field:$get[creationDate-$getGlobalUserVar[language]]:no}
{color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;$channelName[$get[id]] - Channel info:$get[icon]]
$let[topic-enUS;Topic:$replaceText[$replaceText[$checkCondition[$channelTopic[$get[id]]==none];true;None];false;$channelTopic[$get[id]]]]
$let[id-enUS;ID:$get[id]]
$let[creationDate-enUS;Added:<t:$formatDate[$channel[$get[id];created];X]> (<t:$formatDate[$channel[$get[id];created];X]:R>)]
$let[slowmode-enUS;Slowmode:$replaceText[$replaceText[$checkCondition[$getObjectProperty[slowmode]==];true;None];false;$getObjectProperty[slowmode]]]


$let[icon;
$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[
$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[

$channelType[$get[id]]$channelNSFW[$get[id]]$checkCondition[$get[id]==$guild[$guildID;ruleschannel]]

;textfalsefalse;${c.text}]
;texttruefalse;${c.nsfw}]

;voiceundefinedfalse;${c.voice}]

;newsfalsefalse;${c.news}]
;newstruefalse;${c.news}]

;categoryundefinedfalse;${c.category}]

;textfalsetrue;${c.rules}]
;texttruetrue;${c.rules}]

;storefalsefalse;${c.store}]
;storetruefalse;${c.store}]

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