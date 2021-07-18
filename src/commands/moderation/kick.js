const { colors, emojis, links } = require("../../../index");

module.exports.command = {
    name: "kick",
    module: "moderation",
    description_enUS: "Kicks the user with a reason (if specified).",
    usage_enUS: "<@mention | user ID> <reason (optional)>",
    aliases: ['expulse',"gtfo"],
    userPerms: "kick",
    botPerms: "kick",
    code: `
$setUserVar[strikes;**Kick** by <@!$authorID> • $replaceText[$replaceText[$checkCondition[$messageSlice[1]==];true;No reason specified];false;$replaceText[$messageSlice[1];|;]] • <t:$round[$formatDate[$dateStamp;X]]:R>|$getUserVar[strikes;$get[id]];$get[id]]

$kick[$get[id];$replaceText[$replaceText[$checkCondition[$messageSlice[1]==];true;No reason specified];false;$replaceText[$messageSlice[1];|;]]]

$sendDM[$get[id];
{title:${emojis.information} You've got mail!}
{description:
This message was delivered by a moderator of $serverName.
$username[$clientID] is not affiliated with this message, by this moderator and this server.
Learn more about CRBT messages **[here](${links.info.messages})**.
}

{field:Subject:
Kicked from **$serverName** ($guildID)
:no}

{field:Reason from $userTag:
$replaceText[$replaceText[$checkCondition[$messageSlice[1]==];true;Unspecified];false;$replaceText[$messageSlice[1];|;]]
:no}

{footer:You can't reply back to a CRBT message}

{color:${colors.red}}
]

$channelSendMessage[$replaceText[$getServerVar[modlogs_channel];none;$channelID];

{author:$userTag[$get[id]] - Kick:$userAvatar[$get[id]]}
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
{title:${emojis.success} Successfully kicked $userTag[$get[id]].} 
{color:${colors.success}}
;no]

$onlyIf[$rolePosition[$highestRole[$get[id]]]!=$rolePosition[$highestRole[$authorID]];{title:${emojis.error} You can't kick someone that's as high as you in the role hierachy!} {color:${colors.error}}]
$onlyIf[$rolePosition[$highestRole[$get[id]]]>=$rolePosition[$highestRole[$clientID]];{title:${emojis.error} I can't kick someone higher than me in the role hierachy!} {color:${colors.error}}]
$onlyIf[$rolePosition[$highestRole[$get[id]]]>=$rolePosition[$highestRole[$authorID]];{title:${emojis.error} You can't kick someone higher than you in the role hierachy!} {color:${colors.error}}]
$onlyIf[$get[id]!=$ownerID;{execute:cantStrike}]
$onlyIf[$get[id]!=$authorID;{execute:cantStrike}]
$onlyBotPerms[kick;{execute:botPerms}]
$onlyPerms[kick;{execute:userPerms}]
$onlyIf[$userExists[$get[id]]==true;{execute:args}]

$let[id;$replaceText[$replaceText[$replaceText[$message[1];<@!;];<@;];>;]]

$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}