const { colors } = require('../..');

module.exports.joinCommand = {
	channel: "$channelID",
	code: `
$channelSendMessage[$getServerVar[memberlogs_channel];
{author:$userTag\nJoined the server:$authorAvatar}

{field:User:
<@!$authorID>
:yes}

{field:Date:
<t:$round[$formatDate[$dateStamp;X]]>
:yes}

{color:${colors.success}}
]

$onlyIf[$channelExists[$getServerVar[memberlogs_channel]]==true;]

$onlyIf[$getServerVar[memberlogs_channel]!=$getVar[memberlogs_channel];]
$onlyIf[$getServerVar[module_memberLogs]==true;]
	`}