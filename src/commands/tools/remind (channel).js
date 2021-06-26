const { emojis } = require("../../../index");

module.exports.timeoutCommand = {
    code: `
$setGlobalUserVar[reminder$get[count];]
$setGlobalUserVar[reminders;$sub[$get[count];1]]

$channelSendMessage[$timeoutData[channelID];
<@!$timeoutData[userID]>
{title:$get[title-$getGlobalUserVar[language]]}
{description:
**$timeoutData[reminder]**
}
{footer:Reminder set by $userTag[$timeoutData[userID]]}
{timestamp:$timeoutData[timestamp]}
{color:$getGlobalUserVar[color;$timeoutData[userID]]}
]

$let[title-enUS;${emojis.reminder.normal} Reminder]

$onlyIf[$get[count]==$timeoutData[count];]
$let[count;$math[$getGlobalUserVar[reminders]+($replaceText[$getGlobalUserVar[reminders];-;]+$timeoutData[count])]]
$onlyIf[$timeoutData[method]==channel;]
    `}