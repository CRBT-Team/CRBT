const { colors, emojis, links, botinfo } = require("../../index");

module.exports.command = {
  name: "fix",
  aliases: ["fixed", "fixreport"],
  code: `
$deleteCommand

$wait[500ms]

$addCmdReactions[${emojis.general.success}]

$sendDM[$splitText[2];
{title:${emojis.general.information} You've got mail!}
{description:This message was delivered by a verified CRBT developer.
Learn more about official CRBT messages [here](${links.info.messages}).}
{field:Subject:
The bug "[$cropText[$replaceText[$replaceText[$get[reportmessage];\`;];
;];50]...](https://discord.com/channels/738747595438030888/$get[channel]/$message[1])" was successfully fixed.
:no}
{footer:You can't reply back to a CRBT message.}
{color:${colors.cyan}}
]

$textSplit[$get[footer]; | ]

$editMessage[$message;
{title:$get[title]}
{description:$get[description]}
{field:Status:
${emojis.general.success} Fixed in beta ${botinfo.build}
:yes}
{footer:$get[footer]}
{color:${colors.cyan}}
;$get[channel]]

$let[reportmessage;$replaceText[$splitText[2];\`;]]

$textSplit[$get[description];\`\`\`]

$let[title;$getEmbed[$get[channel];$message[1];title]]
$let[description;$getEmbed[$get[channel];$message[1];description]]
$let[footer;$getEmbed[$get[channel];$message[1];footer]]

$let[channel;$replaceText[$replaceText[$clientID;595731552709771264;${links.channels.report}];833327472404594688;${links.channels.reportDev}]]

$argsCheck[>1;{execute:args}]

$setGlobalUserVar[lastCmd;$commandName]
$onlyForIDs[327690719085068289;$botOwnerID;{execute:owneronly}]
  `}