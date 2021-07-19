const { links, illustrations, colors } = require("../../index");

module.exports.botLeaveCommand = {
    channel: `${links.channels.telemetry}`,
    code: `
$deleteServerVar[prefix]

$channelSendMessage[${links.channels.telemetry};
<@!327690719085068289>
{author:Left $serverName ($guildID).}
{color:${colors.error}}
;no]
`}