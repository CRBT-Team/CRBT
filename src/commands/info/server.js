const { emojis } = require("../../../index");

module.exports.command = {
    name: "serverinfo",
    aliases: ["si", "server", "server-info", "server_info", "guildinfo", "gi", "guild_info", "guild-info"],
    module: "info",
    description_enUS: "Gives detailed information about the current server or the given one, if any specified.",
    usage_enUS: "<server ID (optional)>",
    code: `

$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]:$serverIcon}

{description:
$replaceText[$replaceText[$getServerVar[partnered_guild;$get[id]];true;${emojis.general.partner} ];false;]$replaceText[$replaceText[$guild[$get[id];ispartnered];true;${emojis.badges.partner} ];false;]$replaceText[$replaceText[$guild[$get[id];isverified];true;${emojis.badges.partner} ];false;]
$serverDescription
$get[icon-$getGlobalUserVar[language]]
}

{field:$get[id-$getGlobalUserVar[language]]:yes}

{field:$get[owner-$getGlobalUserVar[language]]:yes}

{field:$get[creation-$getGlobalUserVar[language]]:no}

{field:$get[channels-$getGlobalUserVar[language]]:yes}

{field:$get[emojis-$getGlobalUserVar[language]]:yes}

{field:$get[members-$getGlobalUserVar[language]]:yes}

{field:$get[roles-$getGlobalUserVar[language]]:no}

{field:$get[boosts-$getGlobalUserVar[language]]:yes}

{field:$get[features-$getGlobalUserVar[language]]:yes}

{thumbnail:$serverIcon[$get[id]]}
{color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;$serverName[$get[id]] - Information]

$let[icon-enUS;**Icon:** **[2048px]($serverIcon[$get[id];2048])** | **[512px]($serverIcon[$get[id];512])** | **[256px]($serverIcon[$get[id];256])** | \`$getServerVar[prefix]icon\`]

$let[id-enUS;ID:$get[id]]

$let[owner-enUS;Owner:<@!$ownerID>]

$let[creation-enUS;Creation date:$get[creationDate]]

$let[creationDate;$formatDate[$guild[$get[id];created];YYYY]-$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$guild[$get[id];created];MM]]==1];true;0$formatDate[$guild[$get[id];created];MM]];false;$formatDate[$guild[$get[id];created];MM]]-$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$guild[$get[id];created];DD]]==1];true;0$formatDate[$guild[$get[id];created];DD]];false;$formatDate[$guild[$get[id];created];DD]] at $replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$guild[$get[id];created];HH]]==1];true;0$formatDate[$guild[$get[id];created];HH]];false;$formatDate[$guild[$get[id];created];HH]]:$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$guild[$get[id];created];mm]]==1];true;0$formatDate[$guild[$get[id];created];mm]];false;$formatDate[$guild[$get[id];created];mm]] (GMT)]

$let[channels-enUS;Channels ($channelCount):
${emojis.channels.text} $channelCount[text] text
${emojis.channels.voice} $channelCount[voice] voice
${emojis.channels.news} $channelCount[news] announcement
${emojis.channels.category} $channelCount[category] categories]

$let[emojis-enUS;Emojis ($emojiCount):
${emojis.misc.emoji.static} $emojiCount[static] static
${emojis.misc.emoji.animated} $emojiCount[animated] animated]

$let[members-enUS;Members ($membersCount):
${emojis.users.status.online} $membersCount[$get[id];online;yes] ${emojis.users.status.idle} $membersCount[$get[id];idle;yes]
${emojis.users.status.dnd} $membersCount[$get[id];dnd;yes] ${emojis.users.status.invisible} $sum[$membersCount[$get[id];invisible;yes];$membersCount[$get[id];offline;yes]]
${emojis.users.humans} $sub[$membersCount;$botCount] humans
${emojis.users.bots} $botCount bots]

$let[roles-enUS;Role$replaceText[$replaceText[$checkCondition[$roleCount==1];true;];false;s] ($roleCount):$replaceText[$replaceText[$checkCondition[$replaceText[$guildRoles[mention];>,;>]==];true;*None*];false;$replaceText[$guildRoles[mention];>,;>]]]

$let[boosts-enUS;Boosts:$guild[$get[id];boostcount] (level $guild[$get[id];boostlevel])]

$let[features-enUS;Features:$replaceText[$replaceText[$checkCondition[$serverFeatures[$get[id]]==];true;None];false;$serverFeatures[$get[id]]]]



$if[$message==]
    $let[id;$guildID]
$else
    $let[id;$message[1]]
$endif
    `}