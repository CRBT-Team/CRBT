const { colors, emojis } = require("../../../index");

module.exports.command = {
  name: "remindme",
  module: "misc",
  aliases: ['remind','remind-me','set_reminder','set-reminder','reminder'],
  description_enUS: "Sends you a reminder for a specified event in your DMs (or in a channel, if specified or if your DMs are closed).",
  usage_enUS: "<time (e.g. \"3d\" for 3 days)> <#channel (optional)> <subject>",
  code: `
$if[$mentionedChannels[1]==]

$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}
{field:Subject:
$replaceText[$get[reminder];*No subject was set*;None]
:no}
{description:
$replaceText[$replaceText[$checkCondition[$get[day]==$math[$day+1]];true;Tomorrow at <t:$get[date]:T>];false;$replaceText[$replaceText[$checkCondition[$get[day]==$day];true;Today at <t:$get[date]:T>];false;<t:$get[date]>]] • <t:$get[date]:R>
}
{color:${colors.success}}
;no]

$setTimeout[$getObjectProperty[duration]ms;
userID: $authorID
reminder: $get[reminder]
channelID: $channelID
future: $get[date]
timestamp: $round[$math[$dateStamp/1000]]
method: dm
dms: $isUserDMEnabled]

$let[reminder;$replaceText[$replaceText[$checkCondition[$messageSlice[1]==];true;*No subject was set*];false;$messageSlice[1]]]

$else

$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}
{field:Subject:
$replaceText[$get[reminder];*No subject was set*;None]
:no}
{description:
$replaceText[$replaceText[$checkCondition[$get[day]==$math[$day+1]];true;Tomorrow at <t:$get[date]:T>];false;$replaceText[$replaceText[$checkCondition[$get[day]==$day];true;Today at <t:$get[date]:T>];false;<t:$get[date]>]] • <t:$get[date]:R>
}
{color:${colors.success}}
;no]

$setTimeout[$getObjectProperty[duration]ms;
userID: $authorID
reminder: $get[reminder]
channelID: $mentionedChannels[1]
future: $get[date]
timestamp: $round[$math[$dateStamp/1000]]
method: channel]

$let[reminder;$replaceText[$replaceText[$checkCondition[$replaceText[$messageSlice[1];<#$mentionedChannels[1]>;]==];true;*No subject was set*];false;$replaceText[$messageSlice[1];<#$mentionedChannels[1]>;]]]

$endif

$let[day;$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$get[future];DD]]==1];true;0$formatDate[$get[future];DD]];false;$formatDate[$get[future];DD]]]

$let[date;$round[$math[$get[future]/1000]]]
$let[future;$math[$dateStamp+$getObjectProperty[duration]]]

$let[title-enUS;${emojis.success} Reminder set!]

$onlyIf[$getObjectProperty[duration]<63115200000;{title:${emojis.error} Reminders cannot be higher than 2 years for now.} {color:${colors.red}}]

$djsEval[const utils = require('dbd.js-utils')
d.object.durationdone = utils.parseMS("$getObjectProperty[duration]")]

$djsEval[const utils = require('dbd.js-utils')
d.object.duration = utils.parseToMS("$message[1]")]

$onlyIf[$replaceText[$message;$message[1] ;]!=;{execute:args}]
$onlyIf[$checkContains[$toLowercase[$message[1]];s;d;h;m;y;w]==true;{execute:args}]
$onlyIf[$isNumber[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$toLowercase[$message[1]];s;];d;];h;];m;];y;];w;]]==true;{execute:args}]

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
  `}