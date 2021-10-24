const { colors } = require('../..');

module.exports.leaveCommand = {
	channel: "$channelID",
	code: `
$channelSendMessage[$getServerVar[memberlogs_channel];
{author:$userTag\nLeft the server:$authorAvatar}

{field:User:
<@!$authorID>
:yes}

{field:Date:
<t:$round[$formatDate[$dateStamp;X]]>
:yes}

{color:${colors.red}}
]

$onlyIf[$channelExists[$getServerVar[memberlogs_channel]]==true;]

$onlyIf[$getServerVar[memberlogs_channel]!=$getVar[memberlogs_channel];]
$onlyIf[$getServerVar[module_memberLogs]==true;]
	`}