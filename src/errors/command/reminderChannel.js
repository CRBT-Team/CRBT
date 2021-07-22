const { emojis, colors } = require("../../../index");

module.exports.awaitedCommand = {
    name: "reminderChannel",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} Oh no, an error!]
$let[description-enUS;$username[$clientID] cannot send a reminder in this channel for any of these reasons:
• You or I don't have the permissions to send messages there
• This is an announcements or rules channel
• This is a moderation logs or message logs channel]
    `}