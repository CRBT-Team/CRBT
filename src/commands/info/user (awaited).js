const { emojis } = require("../../../index");
const badges = emojis.badges

module.exports.awaitedCommand = {
    name: "userinfo2",
    code: `
$reply[$messageID;
{author:$get[author-$getGlobalUserVar[language]]:$get[status]}

{description:
$get[badges]
$get[avatar-$getGlobalUserVar[language]]
}

{field:$get[id-$getGlobalUserVar[language]]:
$get[id]
:yes}

{field:$get[activity-$getGlobalUserVar[language]]:
$replaceText[$replaceText[$activity[$get[id]];Custom Status;Custom Status:\n$replaceText[$getCustomStatus[$get[id];emoji] ;none ;]$replaceText[$getCustomStatus[$get[id]];none;]
];none;None]
:yes}

{field:$get[accountCreated-$getGlobalUserVar[language]]:no}

{thumbnail:$userAvatar[$get[id];256]}
{color:$getGlobalUserVar[color;$get[id]]}
;no]

$let[accountCreated-enUS;Joined Discord:<t:$formatDate[$creationDate[$get[id];date];X]> (<t:$formatDate[$creationDate[$get[id];date];X]:R>)]

$let[author-enUS;$replaceText[$replaceText[$checkCondition[$charCount[$userTag]<30];true;$userTag[$get[id]]];false;$cropText[$username[$get[id]];25]...#$discriminator[$get[id]]] - User info]
$let[avatar-enUS;**Profile picture:** **[2048px]($replaceText[$userAvatar[$get[id];2048;yes];webp;png])** | **[512px]($replaceText[$userAvatar[$get[id];512;yes];webp;png])** | **[256px]($replaceText[$userAvatar[$get[id];256;yes];webp;png])** | \`$getServerVar[prefix]avatar$replaceText[ $get[id]; $authorID;]\`]

$let[status;$replaceText[$replaceText[$replaceText[$replaceText[$status[$get[id]];dnd;https://cdn.discordapp.com/attachments/782584672772423684/851805534527946762/unknown.png];online;https://cdn.discordapp.com/attachments/782584672772423684/851805512370880512/unknown.png];idle;https://cdn.discordapp.com/attachments/782584672772423684/851805544507113542/unknown.png];offline;https://cdn.discordapp.com/attachments/782584672772423684/851805558503243826/unknown.png]]

$let[badges;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$getUserBadges[$get[id]];Early Verified Developer;];House Balance;${badges.houses.balance}];House Brilliance;${badges.houses.brilliance}];House Bravery;${badges.houses.bravery}];Verified Developer;${badges.developer}];Partnered Server Owner, Discord Partner;${badges.partner} ${badges.nitro}];Early Supporter;${badges.earlySupporter}];Verified Bot;${badges.verifiedBot}];Nitro Classic Nitro Boosting;${badges.nitro}];Nitro Classic;${badges.nitro}];Discord Employee;${badges.discordStaff}];Hypesquad Events;${badges.hypesquad}];Bughunter Level 1;${badges.bugHunter1}];Bughunter Level 2;${badges.bugHunter2}];Nitro Boosting;${badges.nitro}];,;];none;]]

$let[id-enUS;ID]
$let[activity-enUS;Activity]
$let[nick-enUS;Nickname]
$let[noRoles-enUS;*This user doesn't have any roles...*]

$if[$message==]
    $let[id;$authorID]
$else
    $let[id;$findUser[$message]]
$endif
    `}