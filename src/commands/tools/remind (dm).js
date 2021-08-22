const { emojis } = require("../../../index");

module.exports.timeoutCommand = {
    code: `
$sendDM[$timeoutData[userID];
{title:$get[title-$getGlobalUserVar[language]]}
{description:
Set on <t:$timeoutData[timestamp]:D> at <t:$timeoutData[timestamp]:T>.
}
{field:Subject:
$timeoutData[reminder]
:no}
{field:Link:
[Jump to message]($timeoutData[url])
:no}
{color:$getGlobalUserVar[color;$timeoutData[userID]]}
]

$let[title-enUS;${emojis.misc.reminder} Reminder]

$onlyIf[$timeoutData[dms]$timeoutData[method]==truedm;]
    `}