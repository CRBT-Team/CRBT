const { emojis } = require("../../../index");

module.exports.timeoutCommand = {
    code: `
$channelSendMessage[$timeoutData[channelID];
<@!$timeoutData[userID]>
{title:$get[title-$getGlobalUserVar[language]]}
{description:
**$timeoutData[reminder]**
Set by $userTag[$timeoutData[userID]] on $get[future].
}
{color:$getGlobalUserVar[color;$timeoutData[userID]]}
]

$let[future;$formatDate[$timeoutData[timestamp];YYYY]-$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$timeoutData[timestamp];MM]]==1];true;0$formatDate[$timeoutData[timestamp];MM]];false;$formatDate[$timeoutData[timestamp];MM]]-$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$timeoutData[timestamp];DD]]==1];true;0$formatDate[$timeoutData[timestamp];DD]];false;$formatDate[$timeoutData[timestamp];DD]] at $replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$timeoutData[timestamp];HH]]==1];true;0$formatDate[$timeoutData[timestamp];HH]];false;$formatDate[$timeoutData[timestamp];HH]]:$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$timeoutData[timestamp];mm]]==1];true;0$formatDate[$timeoutData[timestamp];mm]];false;$formatDate[$timeoutData[timestamp];mm]]]
$let[title-enUS;${emojis.reminder.normal} Reminder]

$onlyIf[$timeoutData[method]==channel;]
    `}