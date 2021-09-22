const { misc, illustrations, colors } = require("../../index");

module.exports.botLeaveCommand = {
    channel: `${misc.channels.telemetry}`,
    code: `
$deleteServerVar[prefix]
$deleteServerVar[messagelogs_channel]
$deleteServerVar[modlogs_channel]
$deleteServerVar[autoPublishedChannels]
$deleteServerVar[guild_banner]
$deleteServerVar[volume]

$channelSendMessage[${misc.channels.telemetry};
<@!327690719085068289>
{author:Left $serverName ($guildID).}
{color:${colors.error}}
;no]
`}