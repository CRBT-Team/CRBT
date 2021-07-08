const { colors, emojis } = require("../../../index");

module.exports.command = {
    name: "mute",
    module: "moderation",
    description: "Adds the muted role to the user with a reason (if specified).",
    usage_enUS: "<@mention | user ID> <reason (optional)>",
    aliases: ['ftg'],
    userPerms: ["manageroles"],
    botPerms: ["manageroles"],
    code: `
$setUserVar[strikelog;$getUserVar[strikelog;$get[id]]|**Ban** - $replaceText[$replaceText[$checkCondition[$messageSlice[1]==];true;No reason specified];false;$replaceText[$messageSlice[1];|;]] - by <@!$authorID> on <t:$round[$formatDate[$dateStamp;X]]:D> at <t:$round[$formatDate[$dateStamp;X]]:T>;$get[id]]

$giveRole[$get[id];$getServerVar[muted_role]]

$channelSendMessage[$replaceText[$getServerVar[modlogs_channel];none;$channelID];

{author:$userTag[$get[id]] - Mute:$userAvatar[$get[id]]}

{field:User:
<@!$get[id]>
:yes}

{field:Moderator:
<@!$authorID>
:yes}

{field:Strike count:
$getTextSplitLength $replaceText[$replaceText[$checkCondition[$getTextSplitLength==1];true;strike];false;strikes]
$textSplit[$getUserVar[strikelog;$get[id]];|]
:yes}

{field:Reason:
$replaceText[$replaceText[$checkCondition[$messageSlice[1]==];true;Unspecified];false;$replaceText[$messageSlice[1];|;]]
:no}

{color:${colors.orange}}
]

$reply[$messageID;
{title:${emojis.general.success} Successfully muted $userTag[$get[id]].} 
{color:${colors.success}}
;no]

$onlyIf[$rolePosition[$highestRole[$get[id]]]!=$rolePosition[$highestRole[$authorID]];{title:${emojis.general.error} You can't mute someone that's as high as you in the role hierachy!} {color:${colors.red}}]
$onlyIf[$rolePosition[$highestRole[$get[id]]]>=$rolePosition[$highestRole[$clientID]];{title:${emojis.general.error} I can't mute someone higher than me in the role hierachy!} {color:${colors.red}}]
$onlyIf[$rolePosition[$highestRole[$get[id]]]>=$rolePosition[$highestRole[$authorID]];{title:${emojis.general.error} You can't mute someone higher than you in the role hierachy!} {color:${colors.red}}]
$onlyIf[$get[id]!=$ownerID;{title:${emojis.general.error} You can't mute the server's owner!} {color:${colors.red}}]
$onlyIf[$get[id]!=$authorID;{title:${emojis.general.error} You can't mute yourself!} {footer:(I mean technically you could but why would you?)} {color:${colors.red}}]
$onlyIf[$hasRole[$get[id];$getServerVar[muted_role]]==false;{title:${emojis.general.error} This user is already muted!} {color:${colors.red}}]
$onlyIf[$getServerVar[muted_role]!=none;{title:${emojis.general.error} No muted role to give was set!} {description:Use \`$getServerVar[prefix]mutedrole $commandInfo[mutedrole;usage]\` to change it.} {color:${colors.red}}]
$onlyBotPerms[manageroles;{title:${emojis.general.error} I need the permission to manage roles.} {color:${colors.red}}]
$onlyPerms[manageroles;{title:${emojis.general.error} You need the permission to manage roles.} {color:${colors.red}}]
$onlyIf[$userExists[$get[id]]==true;{execute:args}]

$let[id;$replaceText[$replaceText[$message[1];<@!;];>;]]

$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=]$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]$endif
$setGlobalUserVar[lastCmd;$commandName]
    `}