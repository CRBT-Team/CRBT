const colors = require('./json/colors.json');
const emojis = require('./json/emojis.json');
const items = require('./json/items.json');
const jobs = require('./json/jobs.json');
const links = require('./json/links.json');
const tokens = require('./json/tokens.json');
const botinfo = require('./package.json');

module.exports.command = {
  name: "userinfo",
  module: "info",
  aliases: ["ui", "user", "user-info", "user_info"],
  description_enUS: "description.",
  usage_enUS: "<user ID/username/@mention> (optional)",
  botperms: [""],
  code: `
$reply[$messageID;
{author:$get[author-$getGlobalUserVar[language]]:$get[status]}
{description:$replaceText$getUserBadges}
{field:ID:$authorID:no}
{field:Playing:$activity:yes}
{field:Nickname:$nickname:yes}
{field:$replaceText[$replaceText[$checkCondition[$userRoleCount>1];true;Roles];false;Role] ($userRoleCount):
$replaceText[$replaceText[$checkCondition[$userRoles[$authorID;mentions; ]==];true;No roles assigned to the user!];false;$userRoles[$authorID;mentions; ]]
:no}

{field:Global key permissions:
$filterMessageWords[$replaceText[$replaceText[$replaceText[$hasPerms[$authorID;admin];false;$userPerms[$authorID]];true;Administrator (all permissions)];Tts;TTS];no;Add Reactions, ;View Channel, ;Send Messages, ;Use Vad, ;Read Message History, ;Embed Links, ;Connect, ;Speak, ;Use External Emojis, ;Stream, ]
:no}

{field:Account created:
2017-06-23 at 06:05
(1431 days, 8 hours, 35 minutes, 1 seconds ago)
:yes}

{field:Joined server:
2020-11-29 at 12:32
(1431 days, 8 hours, 35 minutes, 1 seconds ago)
:yes}

{thumbnail:$authorAvatar}
;no]

$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}
{description:$get[description-$getGlobalUserVar[language]]}
{color:$getGlobalUserVar[color]}
;no]

$let[author-enUS;$replaceText[$replaceText[$checkCondition[$charCount[$userTag]<30];true;$userTag];false;$cropText[$username;25]...#$discriminator] - Information]
$let[status;$replaceText[$replaceText[$replaceText[$replaceText[$status;dnd;];online;];idle;];offline;]]
$let[badges-enUS;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$getUserBadges;Early Verified Developer;];House Balance;${emojis.badges.house.balance}];House Brilliance;${emojis.badges.house.brilliance}];House Bravery;${emojis.badges.house.bravery}];Verified Developer;${emojis.badges.developer}];Partnered Server Owner, Discord Partner;${emojis.badges.partner} ${emojis.badges.nitro}];Early Supporter;${emojis.badges.earlySupporter}];Verified Bot;${emojis.badges.verifiedBot}];Nitro Classic Nitro Boosting;${emojis.badges.nitro}];Nitro Classic;${emojis.badges.nitro}];Discord Employee;${emojis.badges.discordStaff}];Hypesquad Events;${emojis.badges.hypesquad}];Bughunter Level 1;${emojis.badges.bugHunter1}<:bughunter:585765206769139723>];Bughunter Level 2;${emojis.badges.bugHunter2}];Nitro Boosting;${emojis.badges.nitro}];,;];none;]]
$let[title-enUS;]
$let[description-enUS;description]

$argsCheck[0;{execute:args}]

$setGlobalUserVar[last_cmd;$commandName]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
  `}