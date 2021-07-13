const { colors, emojis } = require("../../../index");

module.exports.command = {
    name: "ban",
    module: "moderation",
    description_enUS: "Bans the user with a reason (if specified).",
    usage_enUS: "<@mention | user ID> <reason (optional)>",
    aliases: ['yeet','permaban'],
    userPerms: "ban",
    botPerms: "ban",
    code: `
$setUserVar[strikes;**Ban** by <@!$authorID> • $replaceText[$replaceText[$checkCondition[$messageSlice[1]==];true;No reason specified];false;$replaceText[$messageSlice[1];|;]] • <t:$round[$formatDate[$dateStamp;X]]:R>|$getUserVar[strikes;$get[id]];$get[id]]

$ban[$get[id];$replaceText[$replaceText[$checkCondition[$messageSlice[1]==];true;No reason specified];false;$replaceText[$messageSlice[1];|;]];0]

$channelSendMessage[$replaceText[$getServerVar[modlogs_channel];none;$channelID];

{author:$userTag[$get[id]] - Ban:$userAvatar[$get[id]]}
{field:User:
<@!$get[id]>
:yes}

{field:Moderator:
<@!$authorID>
:yes}

{field:Strike count:
$getTextSplitLength $replaceText[$replaceText[$checkCondition[$getTextSplitLength==1];true;strike];false;strikes]
$textSplit[$getUserVar[strikes;$get[id]];|]
:yes}

{field:Reason:
$replaceText[$replaceText[$checkCondition[$messageSlice[1]==];true;Unspecified];false;$replaceText[$messageSlice[1];|;]]
:no}

{color:${colors.red}}
]

$reply[$messageID;
{title:${emojis.general.success} Successfully banned $userTag[$get[id]].} 
{color:${colors.success}}
;no]

$onlyIf[$rolePosition[$highestRole[$get[id]]]!=$rolePosition[$highestRole[$authorID]];{title:${emojis.general.error} You can't ban someone that's as high as you in the role hierachy!} {color:${colors.error}}]
$onlyIf[$rolePosition[$highestRole[$get[id]]]>=$rolePosition[$highestRole[$clientID]];{title:${emojis.general.error} I can't ban someone higher than me in the role hierachy!} {color:${colors.error}}]
$onlyIf[$rolePosition[$highestRole[$get[id]]]>=$rolePosition[$highestRole[$authorID]];{title:${emojis.general.error} You can't ban someone higher than you in the role hierachy!} {color:${colors.error}}]
$onlyIf[$get[id]!=$ownerID;{title:${emojis.general.error} You can't ban the server's owner!} {color:${colors.error}}]
$onlyIf[$get[id]!=$authorID;{title:${emojis.general.error} You can't ban yourself!} {footer:(I mean technically you could but why would you?)} {color:${colors.error}}]
$onlyPerms[ban;{title:${emojis.general.error} You need to be able to ban users first!} {color:${colors.error}}]
$onlyBotPerms[ban;{title:${emojis.general.error} I need the permission to ban users first!} {color:${colors.error}}]
$onlyIf[$userExists[$get[id]]==true;{execute:args}]

$let[id;$replaceText[$replaceText[$message[1];<@!;];>;]]

$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}