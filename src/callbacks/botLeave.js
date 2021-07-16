const { links, illustrations, colors } = require("../../index");

module.exports.botLeaveCommand = {
    channel: `${links.channels.telemetry}`,
    code: `
$setServerVar[prefix;$getVar[prefix]]

$channelSendMessage[${links.channels.telemetry};
<@!327690719085068289>
{title:Left $serverName ($guildID).}
{color:${colors.error}}
;no]
`}