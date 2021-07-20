const {colors} = require("../../index");

module.exports.deletedCommand = {
	channel: "$channelID",
	code: `
$channelSendMessage[$getServerVar[messagelogs_channel];
{author:$userTag\nMessage deleted in #$channelName[$channelUsed]:$authorAvatar}

{description:$message}

{field:Channel:
<#$channelUsed>
:yes}

{field:User:
<@!$authorID>
:yes}

{field:Timestamp:
<t:$round[$formatDate[$dateStamp;X]]>
:yes}

{color:${colors.red}}
]

$onlyIf[$channelExists[$getServerVar[messagelogs_channel]]==true;]

$onlyIf[$getServerVar[messagelogs_channel]!=$getVar[messagelogs_channel];]
$onlyIf[$getServerVar[module_messageLogs]==true;]

$setChannelVar[snipeContent;$message]
$setChannelVar[snipeDetails;$authorID//$channelID//$dateStamp]

$onlyIf[$channelType!=dm;]
	`}