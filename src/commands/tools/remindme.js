const { colors, emojis } = require("../../../index");

module.exports.command = {
  name: "remindme",
  module: "misc",
  aliases: ['remind','remind-me','set_reminder','set-reminder','reminder'],
  description_enUS: "Sends you a reminder for a specified event in your DMs (or in a channel, if specified or if your DMs are closed).",
  usage_enUS: "<time (format: 3d = 3 days)> <#channel (optional)> <event name>",
  botperms: [""],
  code: `
$if[$mentionedChannels[1]==]

$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}
{description:**$get[reminder]**
$replaceText[$replaceText[$checkCondition[$get[day]==$math[$day+1]];true;Tomorrow];false;$replaceText[$replaceText[$checkCondition[$get[day]==$day];true;Today];false;$get[date]]] at $get[hour] GMT • In $getObjectProperty[durationdone]
}
{footer:$get[protip-$getGlobalUserVar[language]]}
{color:${colors.success}}
;no]

$setGlobalUserVar[reminder$getGlobalUserVar[reminders];$get[reminder] ⫻∞ $get[future] ⫻∞ $dateStamp ⫻∞ dm]

$setTimeout[$getObjectProperty[duration]ms;
userID: $authorID
reminder: $get[reminder]
channelID: $channelID
future: $get[future]
timestamp: $dateStamp
method: dm
dms: $isUserDMEnabled
count: $getGlobalUserVar[reminders]]

$setGlobalUserVar[reminders;$sum[$getGlobalUserVar[reminders];1]]

$let[reminder;$replaceText[$replaceText[$checkCondition[$messageSlice[1]==];true;*No subject was set*];false;$messageSlice[1]]]

$else

$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}
{description:**$get[reminder]**
$replaceText[$replaceText[$checkCondition[$get[day]==$math[$day+1]];true;Tomorrow];false;$replaceText[$replaceText[$checkCondition[$get[day]==$day];true;Today];false;$get[date]]] at $get[hour] GMT • In $getObjectProperty[durationdone]
}
{footer:$get[protip-$getGlobalUserVar[language]]}
{color:${colors.success}}
;no]

$setGlobalUserVar[reminder$getGlobalUserVar[reminders];$get[reminder] ⫻∞ $get[future] ⫻∞ $dateStamp ⫻∞ channel ⫻∞ $mentionedChannels[1]]

$setTimeout[$getObjectProperty[duration]ms;
userID: $authorID
reminder: $get[reminder]
channelID: $mentionedChannels[1]
future: $get[future]
timestamp: $dateStamp
method: channel
count: $getGlobalUserVar[reminders]]

$setGlobalUserVar[reminders;$sum[$getGlobalUserVar[reminders];1]]

$let[reminder;$replaceText[$replaceText[$checkCondition[$replaceText[$messageSlice[1];<#$mentionedChannels[1]>;]==];true;*No subject was set*];false;$replaceText[$messageSlice[1];<#$mentionedChannels[1]>;]]]

$endif

$let[day;$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$get[future];DD]]==1];true;0$formatDate[$get[future];DD]];false;$formatDate[$get[future];DD]]]
$let[date;$formatDate[$get[future];YYYY]-$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$get[future];MM]]==1];true;0$formatDate[$get[future];MM]];false;$formatDate[$get[future];MM]]-$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$get[future];DD]]==1];true;0$formatDate[$get[future];DD]];false;$formatDate[$get[future];DD]]]
$let[hour;$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$get[future];HH]]==1];true;0$formatDate[$get[future];HH]];false;$formatDate[$get[future];HH]]:$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$get[future];mm]]==1];true;0$formatDate[$get[future];mm]];false;$formatDate[$get[future];mm]]]
$let[future;$math[$dateStamp+$getObjectProperty[duration]]]

$let[title-enUS;${emojis.reminder.set} Reminder set]
$let[protip-enUS;You can check your reminders using the reminders command.]



$onlyIf[$getObjectProperty[duration]<63115200000;{title:${emojis.general.error} Reminders cannot be higher than 2 years for now.} {color:${colors.red}}]

$djsEval[const utils = require('dbd.js-utils')
d.object.durationdone = utils.parseMS("$getObjectProperty[duration]")
d.object.duration = utils.parseToMS("$message[1]")
] 
$createObject[{}]

$onlyIf[$replaceText[$message;$message[1] ;]!=;{execute:args}]
$onlyIf[$checkContains[$toLowercase[$message[1]];s;d;h;m;y;w]==true;{execute:args}]
$onlyIf[$isNumber[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$toLowercase[$message[1]];s;];d;];h;];m;];y;];w;]]==true;{execute:args}]

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=]$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]$endif
$setGlobalUserVar[lastCmd;$commandName]
  `}