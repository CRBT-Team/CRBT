const {colors,emojis,links} = require("../../../index");

module.exports.command = {
    name: "unmute",
    module: "moderation",
    description_enUS: "Removes the muted role of a user.",
    usage_enUS: "<@mention | user ID>",
    userPerms: ["manageroles"],
    botPerms: ["manageroles"],
    code: `
$takeRoles[$get[id];$getServerVar[muted_role]]

$sendDM[$get[id];
{title:${emojis.information} You've got mail!}
{description:
This message was delivered by a moderator of $serverName.
$username[$clientID] is not affiliated with this message, by this moderator and this server.
Learn more about CRBT messages **[here](${links.info.messages})**.
}

{field:Subject:
Unmuted from **$serverName** ($guildID)
:no}

{footer:You can't reply back to a CRBT message}

{color:${colors.green}}
]

$channelSendMessage[$replaceText[$getServerVar[modlogs_channel];none;$channelID];

{author:$userTag[$get[id]] - Unmute:$userAvatar[$get[id]]}
{field:User:
<@!$get[id]>
:yes}

{field:Moderator:
<@!$authorID>
:yes}

{field:Strike count:
$math[$getTextSplitLength-1] $replaceText[$replaceText[$checkCondition[$math[$getTextSplitLength-1]==1];true;strike];false;strikes]
$textSplit[$getUserVar[strikes;$get[id]];|]
:yes}

{color:${colors.green}}
]

$reply[$messageID;
{title:${emojis.success} Successfully unmuted $userTag[$get[id]].} 
{color:${colors.success}}
;no]

$if[$checkContains[$checkCondition[$authorID!=$ownerID]$checkCondition[$memberExists[$message[1]]==false];false]!=true]
$onlyIf[$rolePosition[$highestRole[$get[id]]]!=$rolePosition[$highestRole[$authorID]];{execute:modHierarchy}]
$onlyIf[$rolePosition[$highestRole[$get[id]]]>=$rolePosition[$highestRole[$clientID]];{execute:modHierarchy}]
$onlyIf[$rolePosition[$highestRole[$get[id]]]>=$rolePosition[$highestRole[$authorID]];{execute:modHierarchy}]
$endif
$onlyIf[$get[id]!=$ownerID;{execute:modCantStrike}]
$onlyIf[$get[id]!=$authorID;{execute:modCantStrike}]
$onlyIf[$hasRole[$get[id];$getServerVar[muted_role]]==true;{execute:modAlready}]
$onlyIf[$memberExists[$get[id]]==true;{execute:modAlready}]
$onlyIf[$roleExists[$getServerVar[muted_role]]==true;{execute:noMutedRole}]
$onlyIf[$getServerVar[muted_role]!=none;{execute:noMutedRole}]
$onlyBotPerms[manageroles;{execute:botPerms}]
$onlyPerms[manageroles;{execute:userPerms}]
$onlyIf[$userExists[$get[id]]==true;{execute:args}]

$let[id;$replaceText[$replaceText[$replaceText[$message[1];<@!;];<@;];>;]]

$argsCheck[1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}