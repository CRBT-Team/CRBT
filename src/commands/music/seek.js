const { colors, emojis, tokens, illustrations } = require("../../../index");

module.exports.command = {
    name: "seek",
    aliases: ["seekto"],
    description_enUS: "Seeks to a specified moment in the currently playing song.",
    usage_enUS: "<timestamp (e.g. \"3:50\")>",
    module: "music",
    code: `
$reply[$messageID;
{author:Seeking to $replaceText[$get[current2];:;∶]:$get[icon]}
{color:${colors.success}}
;no]

$let[current2;$replaceText[$replaceText[$splitText[3];(;];);]$textSplit[$songInfo[current_duration]; ]]

$wait[1s]

$seekTo[$replaceText[$replaceText[$checkCondition[$get[s]==s];true;0s];false;$get[s]]]

$let[icon;$replaceText[$replaceText[$checkCondition[$getObjectProperty[ms2]<$getObjectProperty[ms]];true;${illustrations.music.seek_right}];false;${illustrations.music.seek_left}]

$let[s;$replaceText[$getObjectProperty[ms];000;]s]

$djsEval[
const str = "$get[message]".split(":")
const lng = str.length
const thing = "0" + str[lng - 3] + "h0" + str[lng - 2] + "m0" + str[lng - 1] + "s"
const thing2 = thing.replaceAll(undefined, "0")
const tools = require("dbd.js-utils")
const ms = tools.parseToMS(thing2)
d.object.ms = ms

const str2 = "$get[current]".split(":")
const lng2 = str2.length
const thing3 = "0" + str2[lng2 - 3] + "h0" + str2[lng2 - 2] + "m0" + str2[lng2 - 1] + "s"
const thing4 = thing3.replaceAll(undefined, "0")
const ms2 = tools.parseToMS(thing4)
d.object.ms2 = ms2
]

$let[current;$replaceText[$replaceText[$splitText[3];(;];);]$textSplit[$songInfo[current_duration]; ]]

$onlyIf[$isNumber[$replaceText[$get[message];:;]]==true;{execute:args}]

$let[message;$replaceText[$message; ;]]

$onlyIf[$voiceID==$voiceID[$clientID];{execute:samevoice}]

$argsCheck[>1;{execute:args}]
$onlyIf[$getServerVar[music_channel]==$channelID;{execute:wrongChannel}]
$onlyIf[$queueLength!=0;{execute:nomusic}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]

$onlyIf[1==2;{execute:musicDisabled}]
    `}