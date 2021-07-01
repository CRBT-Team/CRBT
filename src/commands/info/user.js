const { emojis } = require("../../../index");
const badges = emojis.badges

module.exports.command = {
    name: "userinfo",
    module: "info",
    aliases: ["ui", "user", "user-info", "user_info"],
    description_enUS: "description.",
    usage_enUS: "<user ID | username | @mention (optional)>",
    code: `
$reply[$messageID;
{author:$get[author-$getGlobalUserVar[language]]:$get[status]}

{description:
$get[badges]
$get[avatar-$getGlobalUserVar[language]]
}

{field:$get[id-$getGlobalUserVar[language]]:
$get[id]
:no}

{field:$get[activity-$getGlobalUserVar[language]]:
$replaceText[$replaceText[$activity[$get[id]];Custom Status;Custom Status: $replaceText[$getCustomStatus[$get[id];emoji] ;none ;]$replaceText[$getCustomStatus[$get[id]];none;]
];none;*None*]
:yes}

{field:$get[nick-$getGlobalUserVar[language]]:
$nickname[$get[id]]
:yes}

{field:$get[roles-$getGlobalUserVar[language]]:
$replaceText[$replaceText[$checkCondition[$userRoles[$get[id];mentions; ]==];true;$get[noRoles-$getGlobalUserVar[language]]];false;$userRoles[$get[id];mentions; ]]
:no}

{field:$get[perms-$getGlobalUserVar[language]]:no}

{field:$get[serverJoined-$getGlobalUserVar[language]]:yes}

{field:$get[accountCreated-$getGlobalUserVar[language]]:yes}

$let[serverJoined-enUS;Joined server:$get[format2-enUS] (GMT)]
$let[format2-enUS;$formatDate[$get[memberJoinedDate];YYYY]-$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$get[memberJoinedDate];MM]]==1];true;0$formatDate[$get[memberJoinedDate];MM]];false;$formatDate[$get[memberJoinedDate];MM]]-$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$get[memberJoinedDate];DD]]==1];true;0$formatDate[$get[memberJoinedDate];DD]];false;$formatDate[$get[memberJoinedDate];DD]] at $replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$get[memberJoinedDate];HH]]==1];true;0$formatDate[$get[memberJoinedDate];HH]];false;$formatDate[$get[memberJoinedDate];HH]]:$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$get[memberJoinedDate];mm]]==1];true;0$formatDate[$get[memberJoinedDate];mm]];false;$formatDate[$get[memberJoinedDate];mm]]]
$let[memberJoinedDate;$memberJoinedDate[$get[id];date]]

$let[perms-enUS;Key permissions:$get[perms]]
$let[perms;$filterMessageWords[$replaceText[$replaceText[$replaceText[$hasPerms[$get[id];admin];false;$userPerms[$get[id]]];true;Administrator (all permissions)];Tts;TTS];no;Add Reactions, ;View Channel, ;Send Messages, ;Use Vad, ;Read Message History, ;Embed Links, ;Connect, ;Speak, ;Use External Emojis, ;Stream, ]]

$let[roles-enUS;$replaceText[$replaceText[$checkCondition[$userRoleCount[$get[id]]>1];true;Roles];false;Role] ($userRoleCount[$get[id]])]

{thumbnail:$userAvatar[$get[id];256]}
{color:$getGlobalUserVar[color;$get[id]]}
;no]

$let[accountCreated-enUS;Joined Discord:$get[format-enUS] (GMT)]
$let[format-enUS;$formatDate[$get[creationDate];YYYY]-$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$get[creationDate];MM]]==1];true;0$formatDate[$get[creationDate];MM]];false;$formatDate[$get[creationDate];MM]]-$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$get[creationDate];DD]]==1];true;0$formatDate[$get[creationDate];DD]];false;$formatDate[$get[creationDate];DD]] at $replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$get[creationDate];HH]]==1];true;0$formatDate[$get[creationDate];HH]];false;$formatDate[$get[creationDate];HH]]:$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$get[creationDate];mm]]==1];true;0$formatDate[$get[creationDate];mm]];false;$formatDate[$get[creationDate];mm]]]

$let[author-enUS;$replaceText[$replaceText[$checkCondition[$charCount[$userTag]<30];true;$userTag[$get[id]]];false;$cropText[$username[$get[id]];25]...#$discriminator[$get[id]]] - Information]
$let[avatar-enUS;**Profile picture:** **[2048px]($replaceText[$userAvatar[$get[id];2048;yes];webp;png])** | **[512px]($replaceText[$userAvatar[$get[id];512;yes];webp;png])** | **[256px]($replaceText[$userAvatar[$get[id];256;yes];webp;png])** | \`$getServerVar[prefix]avatar\`]

$let[status;$replaceText[$replaceText[$replaceText[$replaceText[$status[$get[id]];dnd;https://cdn.discordapp.com/attachments/782584672772423684/851805534527946762/unknown.png];online;https://cdn.discordapp.com/attachments/782584672772423684/851805512370880512/unknown.png];idle;https://cdn.discordapp.com/attachments/782584672772423684/851805544507113542/unknown.png];offline;https://cdn.discordapp.com/attachments/782584672772423684/851805558503243826/unknown.png]]

$let[creationDate;$creationDate[$get[id];date]]

$let[badges;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$getUserBadges[$get[id]];Early Verified Developer;];House Balance;${badges.houses.balance}];House Brilliance;${badges.houses.brilliance}];House Bravery;${badges.houses.bravery}];Verified Developer;${badges.developer}];Partnered Server Owner, Discord Partner;${badges.partner} ${badges.nitro}];Early Supporter;${badges.earlySupporter}];Verified Bot;${badges.verifiedBot}];Nitro Classic Nitro Boosting;${badges.nitro}];Nitro Classic;${badges.nitro}];Discord Employee;${badges.discordStaff}];Hypesquad Events;${badges.hypesquad}];Bughunter Level 1;${badges.bugHunter1}];Bughunter Level 2;${badges.bugHunter2}];Nitro Boosting;${badges.nitro}];,;];none;]]

$let[id-enUS;ID]
$let[activity-enUS;Activity]
$let[nick-enUS;Nickname]
$let[noRoles-enUS;*This user doesn't have any roles...*]

$onlyIf[$get[memberExists]==true;{execute:userinfo2}]

$if[$message==]
    $let[memberExists;$checkCondition[$guildID!=]]
    $let[id;$authorID]
$else
    $let[memberExists;$memberExists[$get[id]]]
    $let[id;$findUser[$message]]
    $onlyIf[$findUser[$message;no]!=undefined;{execute:usernotfound}]
    $onlyIf[$channelType!=dm;{execute:guildOnly}]
$endif

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}