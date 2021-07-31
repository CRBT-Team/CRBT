const { links, illustrations, colors } = require("../../index");

module.exports.botLeaveCommand = {
    channel: `${links.channels.telemetry}`,
    code: `
$deleteServerVar[prefix]
$deleteServerVar[messagelogs_channel]
$deleteServerVar[modlogs_channel]
$deleteServerVar[autoPublishedChannels]
$deleteServerVar[guild_banner]
$deleteServerVar[partnered_guild]
$deleteServerVar[volume]

$channelSendMessage[${links.channels.telemetry};
<@!327690719085068289>
{author:Left $serverName ($guildID).}
{color:${colors.error}}
;no]
`}