const { colors, emojis, links } = require("../../../index");

module.exports.command = {
    name: "fix",
    aliases: ["fixed", "fixreport"],
    module: "admin",
    code: `
$deleteCommand

$wait[500ms]

$addCmdReactions[${emojis.success}]

$sendDM[$replaceText[$replaceText[$splitText[1];<@!;];>;];
{title:${emojis.information} You've got mail!}
{description:This message was delivered by a verified CRBT developer.
Learn more about CRBT messages **[here](${links.info.messages})**.
}
{field:Subject:
Your $replaceText[$replaceText[$get[title];Bug report;reported bug];Suggestion;suggestion] "[$cropText[$replaceText[$replaceText[$get[reportmessage];\`;];
;];50]$replaceText[$replaceText[$checkCondition[$charCount[$get[reportmessage]]>50];true;...];false;]](https://discord.com/channels/738747595438030888/$get[channel]/$message[1])" was successfully $replaceText[$replaceText[$get[title];Bug report;fixed!];Suggestion;added to CRBT!].
:no}
{footer:You can't reply back to a CRBT message.}
{color:${colors.success}}
]

$textSplit[$get[description]; in ]

$clearReactions[$get[channel];$message[1];${emojis.misc.thumbsdown}]
$clearReactions[$get[channel];$message[1];${emojis.misc.thumbsup}]

$editMessage[$message[1];
{title:$get[title]}
{description:$replaceText[$get[description];#LEFT_BRACKET#;#LEFT_BRACKET#]}
{field:Status:
${emojis.success} $replaceText[$replaceText[$get[title];Bug report;Fixed];Suggestion;Added]
:yes}
{footer:$get[footer]}
{color:${colors.success}}
;$get[channel]]

$let[reportmessage;$replaceText[$splitText[2];\`;]]

$textSplit[$get[description];\`\`\`]

$let[title;$getEmbed[$get[channel];$message[1];title]]
$let[description;$getEmbed[$get[channel];$message[1];description]]
$let[footer;$getEmbed[$get[channel];$message[1];footer]]

$let[channel;$replaceText[$replaceText[$checkCondition[$clientID==${links.CRBTclientID}];true;${links.channels.report}];false;${links.channels.reportDev}]]

$argsCheck[>1;{execute:args}]

$setGlobalUserVar[lastCmd;$commandName]
$onlyForIDs[327690719085068289;$botOwnerID;{execute:owneronly}]
    `}