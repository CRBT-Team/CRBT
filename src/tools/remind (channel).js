const emojis = require('../../json/emojis.json');
const colors = require('../../json/colors.json');

module.exports.timeoutCommand = {
    code: `
$setGlobalUserVar[active_reminders;$replaceText[$getGlobalUserVar[active_reminders;$timeoutData[userID]];
$timeoutData[reminder] ⫻∞ $timeoutData[future] ⫻∞ $timeoutData[timestamp] ⫻∞ $timeoutData[method];];$timeoutData[userID]]

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

$onlyIf[$timeoutData[method]==channel;]
    `}