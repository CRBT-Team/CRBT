const { emojis } = require("../../index");

module.exports.timeoutCommand = {
    code: `
$setGlobalUserVar[reminder$get[count];]
$setGlobalUserVar[reminders;$sub[$get[count];1]]

$sendDM[$timeoutData[userID];
{title:$get[title-$getGlobalUserVar[language]]}
{description:**$timeoutData[reminder]**
}
{footer:Reminder set}
{timestamp:$timeoutData[timestamp]}
{color:$getGlobalUserVar[color;$timeoutData[userID]]}
]

$let[title-enUS;${emojis.reminder.normal} Reminder]

$onlyIf[$get[count]==$timeoutData[count];]
$let[count;$math[$getGlobalUserVar[reminders]+($replaceText[$getGlobalUserVar[reminders];-;]+$timeoutData[count])]]
$onlyIf[$timeoutData[dms]$timeoutData[method]==truedm;]
    `}