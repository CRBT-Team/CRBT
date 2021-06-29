const { emojis } = require("../../../index");

module.exports.command = {
    name: "serverinfo",
    aliases: ["si", "server", "server-info", "server_info", "guildinfo", "gi", "guild_info", "guild-info"],
    module: "info",
    description_enUS: "Gives detailed information about the current server or the given one, if any specified.",
    usage_enUS: "<server ID (optional)>",
    code: `

$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]:$get[icon]}

{description:
$replaceText[$replaceText[$getServerVar[partnered_guild;$get[id]];true;${emojis.general.partner} ];false;]$replaceText[$replaceText[$guild[$get[id];ispartnered];true;${emojis.badges.partner} ];false;]$replaceText[$replaceText[$guild[$get[id];isverified];true;${emojis.badges.partner} ];false;]
$serverDescription
$get[icon-$getGlobalUserVar[language]]
}

{field:$get[id-$getGlobalUserVar[language]]:yes}

{field:$get[owner-$getGlobalUserVar[language]]:yes}

{field:$get[creation-$getGlobalUserVar[language]]:no}

$if[$message==]
    {field:$get[channels-$getGlobalUserVar[language]]:yes}
$endif

{field:$get[emojis-$getGlobalUserVar[language]]:yes}

{field:$get[members-$getGlobalUserVar[language]]:yes}

$if[$message==]
    {field:$get[roles-$getGlobalUserVar[language]]:no}
$endif

{field:$get[boosts-$getGlobalUserVar[language]]:yes}

{field:$get[features-$getGlobalUserVar[language]]:yes}

{field:$get[verification-$getGlobalUserVar[language]]:yes}

{field:$get[content-$getGlobalUserVar[language]]:yes}

{thumbnail:$get[icon]}
{color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;$serverName[$get[id]] - Information]

$let[icon-enUS;**Icon:** $replaceText[$replaceText[$checkCondition[$serverIcon[$get[id]]==null];true;*None*];false;**[2048px]($serverIcon[$get[id];2048])** | **[512px]($serverIcon[$get[id];512])** | **[256px]($serverIcon[$get[id];256])** | \`$getServerVar[prefix]icon\`]]

$let[id-enUS;ID:$get[id]]

$let[owner-enUS;Owner:<@!$ownerID[$get[id]]>]

$let[creation-enUS;Creation date:$get[creationDate]]

$let[creationDate;$formatDate[$guild[$get[id];created];YYYY]-$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$guild[$get[id];created];MM]]==1];true;0$formatDate[$guild[$get[id];created];MM]];false;$formatDate[$guild[$get[id];created];MM]]-$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$guild[$get[id];created];DD]]==1];true;0$formatDate[$guild[$get[id];created];DD]];false;$formatDate[$guild[$get[id];created];DD]] at $replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$guild[$get[id];created];HH]]==1];true;0$formatDate[$guild[$get[id];created];HH]];false;$formatDate[$guild[$get[id];created];HH]]:$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$guild[$get[id];created];mm]]==1];true;0$formatDate[$guild[$get[id];created];mm]];false;$formatDate[$guild[$get[id];created];mm]] (GMT)]

$let[channels-enUS;Channels ($channelCount):
${emojis.channels.text} $channelCount[text] text
${emojis.channels.voice} $channelCount[voice] voice
${emojis.channels.news} $channelCount[news] announcement
${emojis.channels.category} $channelCount[category] categories]

$let[emojis-enUS;Emojis ($emojiCount[all;$get[id]]):
${emojis.misc.emoji.static} $emojiCount[normal;$get[id]] static
${emojis.misc.emoji.animated} $emojiCount[animated;$get[id]] animated]

$let[members-enUS;Members ($membersCount[$get[id]]):
${emojis.users.status.online} $membersCount[$get[id];online;yes] ${emojis.users.status.idle} $membersCount[$get[id];idle;yes]
${emojis.users.status.dnd} $membersCount[$get[id];dnd;yes] ${emojis.users.status.invisible} $sum[$membersCount[$get[id];invisible;yes];$membersCount[$get[id];offline;yes]]
${emojis.users.humans} $sum[$membersCount[$get[id];dnd;no];$membersCount[$get[id];online;no];$membersCount[$get[id];offline;no];$membersCount[$get[id];idle;no]] humans
${emojis.users.bots} $sub[$membersCount[$get[id]];$sum[$membersCount[$get[id];dnd;no];$membersCount[$get[id];online;no];$membersCount[$get[id];offline;no];$membersCount[$get[id];idle;no]]] bots]

$let[roles-enUS;Role$replaceText[$replaceText[$checkCondition[$sub[$roleCount;1]==1];true;];false;s] ($sub[$roleCount;1]):$replaceText[$replaceText[$checkCondition[$replaceText[$guildRoles[mention];>,;>]==];true;*None*];false;$replaceText[$guildRoles[mention];>,;>]]]

$let[boosts-enUS;Boosts:$guild[$get[id];boostcount] (level $guild[$get[id];boostlevel])]

$let[features-enUS;Features:$replaceText[$replaceText[$checkCondition[$serverFeatures[$get[id]]==];true;None];false;$serverFeatures[$get[id]]]]

$let[verification-enUS;Verification level:$toLocaleUppercase[$guild[$get[id];verificationlvl]]

$let[content-enUS;Content filter:$serverContentFilter[$get[id]]]

$let[icon;$replaceText[$replaceText[$checkContains[$serverIcon[$get[id]];null];false;$replaceText[$serverIcon[$get[id];256;yes];webp;png]];true;https://textoverimage.moesif.com/image?image_url=https://cdn.discordapp.com/attachments/782584672772423684/843183376004677673/unknown.png&text=$guild[$get[id];acronym]&text_color=ffffffff&text_size=128&y_align=middle&x_align=center]]

$if[$message==]
    $let[id;$guildID]
$else
    $let[id;$message[1]]
    $onlyIf[$serverExists[$message[1]]==true;{execute:serverNotFound}]
$endif
    `}