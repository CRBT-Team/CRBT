const {colors} = require("../../index");

module.exports.updateCommand = {
	channel: "$channelID",
	code: `
$channelSendMessage[$getServerVar[messagelogs_channel];
{author:$userTag\nMessage edited in #$channelName[$channelUsed]:$authorAvatar}

{field:Previous message:
$oldMessage
:yes}

{field:New message:
$message
:yes}

{field:Link:
[Jump to message](https://discord.com/channels/$guildID/$channelUsed/$messageID)
:no}

{field:Channel:
<#$channelUsed>
:yes}

{field:User:
<@!$authorID>
:yes}

{field:Timestamp:
<t:$round[$formatDate[$dateStamp;X]]>
:yes}

{color:${colors.orange}}
]

$onlyIf[$channelExists[$getServerVar[messagelogs_channel]]==true;]

$onlyIf[$message!=$oldMessage;]
$onlyIf[$getServerVar[messagelogs_channel]!=$getVar[messagelogs_channel];]
$onlyIf[$getServerVar[module_messageLogs]==true;]
$onlyIf[$channelType!=dm;]
	`}