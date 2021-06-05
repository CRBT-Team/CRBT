const colors = require('../../json/colors.json');
const emojis = require('../../json/emojis.json');
const links = require('../../json/links.json');
const botinfo = require('../../package.json');

module.exports.command = {
  name: "reply",
  module: "basic",
  aliases: ["replyreport"],
  code: `
$deleteCommand

$wait[500ms]

$addCmdReactions[${emojis.general.success}]
  
$sendDM[$splitText[2];
{title:${emojis.general.information} You've got mail!}
{description:This message was delivered by a verified CRBT developer.
Learn more about official CRBT messages [here](${links.info.messages}).}
{field:Subject:
Reported $toLowercase[$get[title]] "[$cropText[$replaceText[$replaceText[$get[reportmessage];\`;];
;];50]...](https://discord.com/channels/738747595438030888/$get[channel]/$message[1])"
:no}
{field:Message from $userTag:
$messageSlice[1]
:no}
{footer:You can't reply back to a CRBT message.}
{color:${colors.blue}}
]

$textSplit[$get[footer]; | ]

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

$let[channel;$replaceText[$replaceText[$clientID;595731552709771264;${links.channels.report}];833327472404594688;${links.channels.reportDev}]]

$let[title;$getEmbed[$get[channel];$message[1];title]]
$let[description;$getEmbed[$get[channel];$message[1];description]]
$let[footer;$getEmbed[$get[channel];$message[1];footer]]

$argsCheck[>1;{execute:args}]

$setGlobalUserVar[lastCmd;$commandName]
$onlyForIDs[$botOwnerID;{execute:owneronly}]
  `}