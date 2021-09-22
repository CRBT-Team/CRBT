const { colors, emojis, links, misc } = require("../../../index");

module.exports.command = {
    name: "reply",
    aliases: ["replyreport", "message"],
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
$get[title] "[$cropText[$replaceText[$replaceText[$get[reportmessage];\`;];
;];50]$replaceText[$replaceText[$checkCondition[$charCount[$get[reportmessage]]>50];true;...];false;]](https://discord.com/channels/738747595438030888/$get[channel]/$message[1])"
:no}
{field:Message from $userTag:
$messageSlice[1]
:no}
{footer:You can't reply back to a CRBT message.}
{color:${colors.blue}}
]

$textSplit[$get[description]; in ]

$editMessage[$message[1];
{title:$get[title]}
{description:$get[description]}
{field:Status:
Pending
:no}
$if[$messageSlice[1]!=]
{field:Message from $userTag:
$messageSlice[1]
:no}
$endif
{footer:$get[footer]}
{color:${colors.orange}}
;$get[channel]]

$let[reportmessage;$replaceText[$splitText[2];\`;]]

$textSplit[$get[description];\`\`\`]

$let[title;$getEmbed[$get[channel];$message[1];title]]
$let[description;$getEmbed[$get[channel];$message[1];description]]
$let[footer;$getEmbed[$get[channel];$message[1];footer]]

$let[channel;$replaceText[$replaceText[$checkCondition[$clientID==${misc.CRBTid}];true;${misc.channels.report}];false;${misc.channels.reportDev}]]

$argsCheck[>1;{execute:args}]

$setGlobalUserVar[lastCmd;$commandName]
$onlyForIDs[327690719085068289;$botOwnerID;{execute:owneronly}]
    `}