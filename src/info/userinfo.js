const emojis = require('../../json/emojis.json');
const links = require('../../json/links.json');
const badges = emojis.badges

module.exports.command = {
  name: "userinfo",
  module: "info",
  aliases: ["ui", "user", "user-info", "user_info"],
  description_enUS: "description.",
  usage_enUS: "<user ID/username/@mention> (optional)",
  botperms: [""],
  code: `
$if[$error!=]
$loop[1;sendError]
$endif

$if[$message==]
$reply[$messageID;
{author:$get[author-$getGlobalUserVar[language]]:$get[status]}

{description:
$get[badges]
$get[avatar-$getGlobalUserVar[language]]
}

{field:$get[id-$getGlobalUserVar[language]]:
$authorID
:no}

{field:$get[activity-$getGlobalUserVar[language]]:
$replaceText[$activity;Custom Status;Custom Status: $replaceText[$getCustomStatus[$authorID;emoji] ;none ;]$replaceText[$getCustomStatus;none;]
]
:yes}

{field:$get[nick-$getGlobalUserVar[language]]:
$nickname
:yes}

{field:$get[roles-$getGlobalUserVar[language]]:
$replaceText[$replaceText[$checkCondition[$userRoles[$authorID;mentions; ]==];true;$get[noRoles-$getGlobalUserVar[language]]];false;$userRoles[$authorID;mentions; ]]
:no}

{field:$get[perms-$getGlobalUserVar[language]]:no}

{field:$get[accountCreated-$getGlobalUserVar[language]]
:yes}

{field:$get[serverJoined-$getGlobalUserVar[language]]
:yes}

{thumbnail:$authorAvatar}
{color:$getGlobalUserVar[color]}
;no]

$let[author-enUS;$replaceText[$replaceText[$checkCondition[$charCount[$userTag]<30];true;$userTag];false;$cropText[$username;25]...#$discriminator] - Information]
$let[avatar-enUS;**Profile picture:** **[2048px]($replaceText[$userAvatar[$authorID;2048;yes];webp;png])** | **[512px]($replaceText[$userAvatar[$authorID;512;yes];webp;png])** | **[256px]($replaceText[$userAvatar[$authorID;256;yes];webp;png])** | \`$getServerVar[prefix]avatar\`]

$let[status;$replaceText[$replaceText[$replaceText[$replaceText[$status;dnd;https://cdn.discordapp.com/attachments/782584672772423684/849666960592732180/unknown.png];online;https://cdn.discordapp.com/attachments/782584672772423684/849666928267493397/unknown.png];idle;https://cdn.discordapp.com/attachments/782584672772423684/849666951202209812/unknown.png];offline;https://cdn.discordapp.com/attachments/782584672772423684/849666974941577286/unknown.png]]

$let[accountCreated-enUS;Joined Discord:$get[format-enUS]]

$let[format-enUS;$formatDate[$creationDate[$authorID;date];YYYY]-$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$creationDate[$authorID;date];MM]]==1];true;0$formatDate[$creationDate[$authorID;date];MM]];false;$formatDate[$creationDate[$authorID;date];MM]]-$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$creationDate[$authorID;date];DD]]==1];true;0$formatDate[$creationDate[$authorID;date];DD]];false;$formatDate[$creationDate[$authorID;date];DD]] at $replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$creationDate[$authorID;date];HH]]==1];true;0$formatDate[$creationDate[$authorID;date];HH]];false;$formatDate[$creationDate[$authorID;date];HH]]:$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$creationDate[$authorID;date];mm]]==1];true;0$formatDate[$creationDate[$authorID;date];mm]];false;$formatDate[$creationDate[$authorID;date];mm]]
($user[$authorID;timestamp] ago)]

$let[serverJoined-enUS;Joined server:$get[format2-enUS]]

$let[format2-enUS;$formatDate[$memberJoinedDate[$authorID;date];YYYY]-$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$memberJoinedDate[$authorID;date];MM]]==1];true;0$formatDate[$memberJoinedDate[$authorID;date];MM]];false;$formatDate[$memberJoinedDate[$authorID;date];MM]]-$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$memberJoinedDate[$authorID;date];DD]]==1];true;0$formatDate[$memberJoinedDate[$authorID;date];DD]];false;$formatDate[$memberJoinedDate[$authorID;date];DD]] at $replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$memberJoinedDate[$authorID;date];HH]]==1];true;0$formatDate[$memberJoinedDate[$authorID;date];HH]];false;$formatDate[$memberJoinedDate[$authorID;date];HH]]:$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$memberJoinedDate[$authorID;date];mm]]==1];true;0$formatDate[$memberJoinedDate[$authorID;date];mm]];false;$formatDate[$memberJoinedDate[$authorID;date];mm]]]

$let[perms-enUS;Key permissions:$get[perms]]

$let[perms;$filterMessageWords[$replaceText[$replaceText[$replaceText[$hasPerms[$authorID;admin];false;$userPerms[$authorID]];true;Administrator (all permissions)];Tts;TTS];no;Add Reactions, ;View Channel, ;Send Messages, ;Use Vad, ;Read Message History, ;Embed Links, ;Connect, ;Speak, ;Use External Emojis, ;Stream, ]]

$let[badges;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$getUserBadges;Early Verified Developer;];House Balance;${badges.houses.balance}];House Brilliance;${badges.houses.brilliance}];House Bravery;${badges.houses.bravery}];Verified Developer;${badges.developer}];Partnered Server Owner, Discord Partner;${badges.partner} ${badges.nitro}];Early Supporter;${badges.earlySupporter}];Verified Bot;${badges.verifiedBot}];Nitro Classic Nitro Boosting;${badges.nitro}];Nitro Classic;${badges.nitro}];Discord Employee;${badges.discordStaff}];Hypesquad Events;${badges.hypesquad}];Bughunter Level 1;${badges.bugHunter1}];Bughunter Level 2;${badges.bugHunter2}];Nitro Boosting;${badges.nitro}];,;];none;]]

$let[roles-enUS;$replaceText[$replaceText[$checkCondition[$userRoleCount>1];true;Roles];false;Role] ($userRoleCount)]

$endif


$let[id-enUS;ID]
$let[activity-enUS;Activity]
$let[nick-enUS;Nickname]
$let[noRoles-enUS;*This user doesn't have any roles...*]

$argsCheck[0;{execute:args}]

$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
  `}
/*$if[$getServerVar[module_allowedChannels]!=true] $onlyIf[$checkContains[$getServerVar[allowedChannels];$channelID]==true;placeholder error xd] $endif
this ^ is the supposed to be for the allowed channels thing*/