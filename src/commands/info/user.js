const { emojis } = require("../../../index");
const badges = emojis.badges

module.exports.command = {
    name: "userinfo",
    module: "info",
    aliases: ["ui", "user", "user-info", "user_info"],
    description_enUS: "Fetches info on a specified user, or yourself if nobody is specified.",
    usage_enUS: "<user ID | username | @mention (optional)>",
    examples_enUS: [
        "userinfo CRBT",
        "ui 327690719085068289",
        "user CRBT Dev#6796"
    ],
    code: `
$reply[$messageID;
{author:$get[author-$getGlobalUserVar[language]]:$get[status]}

{description:
$replaceText[$get[badges]; ${badges.nitro} ${badges.nitro} ; ${badges.nitro} ]
$get[avatar-$getGlobalUserVar[language]]
$replaceText[$replaceText[$checkCondition[$getObjectProperty[banner]==];true;];false;$get[banner-$getGlobalUserVar[language]]]
}

{field:$get[id-$getGlobalUserVar[language]]:
$get[id]
:no}

{field:$get[activity-$getGlobalUserVar[language]]:
$replaceText[$replaceText[$activity[$get[id]];Custom Status;Custom Status:\n$replaceText[$getCustomStatus[$get[id];emoji] ;none ;]$replaceText[$getCustomStatus[$get[id]];none;]
];none;None]
:yes}

{field:$get[nick-$getGlobalUserVar[language]]:
$nickname[$get[id]]
:yes}

{field:Profile color:
$replaceText[$replaceText[$checkCondition[$get[color]==];true;None];false;$get[color]]
:yes}

{field:$get[roles-$getGlobalUserVar[language]]:
$replaceText[$replaceText[$checkCondition[$userRoles[$get[id];mentions; ]==];true;$get[noRoles-$getGlobalUserVar[language]]];false;$userRoles[$get[id];mentions; ]]
:no}

{field:$get[perms-$getGlobalUserVar[language]]:no}

{field:$get[serverJoined-$getGlobalUserVar[language]]:yes}

{field:$get[accountCreated-$getGlobalUserVar[language]]:yes}

$let[serverJoined-enUS;Joined server:<t:$formatDate[$memberJoinedDate[$get[id];date];X]> (<t:$formatDate[$memberJoinedDate[$get[id];date];X]:R>)]

$let[perms-enUS;Key permissions:$get[perms]]
$let[perms;$filterMessageWords[$replaceText[$replaceText[$replaceText[$hasPerms[$get[id];admin];false;$userPerms[$get[id]]];true;Administrator (all permissions)];Tts;TTS];no;Add Reactions, ;View Channel, ;Send Messages, ;Use Vad, ;Read Message History, ;Embed Links, ;Connect, ;Speak, ;Use External Emojis, ;Stream, ]]

$let[roles-enUS;$replaceText[$replaceText[$checkCondition[$userRoleCount[$get[id]]>1];true;Roles];false;Role] ($userRoleCount[$get[id]])]

{image:$get[banner]4096}

{thumbnail:$userAvatar[$get[id];256]}
{color:$replaceText[$replaceText[$checkCondition[$get[color]==];true;$getGlobalUserVar[color;$get[id]]];false;$get[color]]}
;no]

$let[color;$getObjectProperty[banner_color]]

$let[accountCreated-enUS;Joined Discord:<t:$formatDate[$creationDate[$get[id];date];X]> (<t:$formatDate[$creationDate[$get[id];date];X]:R>)]

$let[author-enUS;$replaceText[$replaceText[$checkCondition[$charCount[$userTag]<30];true;$userTag[$get[id]]];false;$cropText[$username[$get[id]];25]...#$discriminator[$get[id]]] - User info]
$let[avatar-enUS;Profile picture: **[2048px]($replaceText[$userAvatar[$get[id];2048;yes];webp;png])** | **[512px]($replaceText[$userAvatar[$get[id];512;yes];webp;png])** | **[256px]($replaceText[$userAvatar[$get[id];256;yes];webp;png])** | \`$getServerVar[prefix]avatar$replaceText[ $get[id]; $authorID;]\`]
$let[banner-enUS;Banner: **[2048px]($get[banner]2048)** | **[512px]($get[banner]512)** | **[256px]($get[banner]256)** | \`$getServerVar[prefix]userbanner$replaceText[ $get[id]; $authorID;]\`]

$let[banner;https://cdn.discordapp.com/banners/$get[id]/$getObjectProperty[banner].$replaceText[$replaceText[$get[animated];false;png];true;gif]?size=]

$let[animated;$stringStartsWith[$getObjectProperty[banner];a_]]

$createObject[$jsonRequest[https://discordapp.com/api/users/$get[id];;;Authorization:Bot $clientToken]]

$let[status;$replaceText[$replaceText[$replaceText[$replaceText[$status[$get[id]];dnd;https://cdn.discordapp.com/attachments/782584672772423684/851805534527946762/unknown.png];online;https://cdn.discordapp.com/attachments/782584672772423684/851805512370880512/unknown.png];idle;https://cdn.discordapp.com/attachments/782584672772423684/851805544507113542/unknown.png];offline;https://cdn.discordapp.com/attachments/782584672772423684/851805558503243826/unknown.png]]

$let[badges;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$getUserBadges[$get[id]];Early Verified Developer;];House Balance;${badges.houses.balance}];House Brilliance;${badges.houses.brilliance}];House Bravery;${badges.houses.bravery}];Verified Developer;${badges.developer}];Partnered Server Owner, Discord Partner;${badges.partner} ${badges.nitro}];Early Supporter;${badges.earlySupporter}];Verified Bot;${badges.verifiedBot}];Nitro Classic Nitro Boosting;${badges.nitro}];Nitro Classic;${badges.nitro}];Discord Employee;${badges.discordStaff}];Hypesquad Events;${badges.hypesquad}];Bughunter Level 1;${badges.bugHunter1}];Bughunter Level 2;${badges.bugHunter2}];Nitro Boosting;${badges.nitro}];,;];none;]]

$let[id-enUS;ID]
$let[activity-enUS;Activity]
$let[nick-enUS;Nickname]
$let[noRoles-enUS;*This user doesn't have any roles...*]

$onlyIf[$get[memberExists]==true;{execute:userinfo2}]

$if[$message==]
    $let[memberExists;$checkCondition[$channelType!=dm]]
    $let[id;$authorID]
$else
    $let[memberExists;$memberExists[$get[id]]]
    $let[id;$findUser[$message]]
    $onlyIf[$findUser[$message;no]!=undefined;{execute:usernotfound}]
$endif

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}