const colors = require('../../json/colors.json');
const emojis = require('../../json/emojis.json');
const links = require('../../json/links.json');
const botinfo = require('../../package.json');

module.exports.command = {
  name: "refuse",
  module: "basic",
  aliases: ["cancelreport"],
  code: `
$deleteCommand

$wait[500ms]

$addCmdReactions[${emojis.general.success}]
  
$sendDM[$splitText[2];
{title:${emojis.general.information} You've got mail!}
{description:This message was delivered by a verified CRBT developer.
Learn more about official CRBT messages [here](${links.info.messages}).}
{field:Subject:
$replaceText[$toLocaleUppercase[$get[title]];Report;report] "[$cropText[$replaceText[$replaceText[$get[reportmessage];\`;];
;];50]...](https://discord.com/channels/738747595438030888/841349909261451295/$message[1])" refused.
:no}
{field:Message from $userTag:
$messageSlice[1]
:no}
{footer:You can't reply back to a CRBT message.}
{color:${colors.red}}
]

$textSplit[$get[footer]; | ]

$editMessage[$message[1];
{title:$get[title]}
{description:$get[description]}
{field:Status:
${emojis.general.error} Won't be added
:no}
{field:Message from $userTag:
$messageSlice[1]
:no}
{footer:$get[footer]}
{color:${colors.red}}
;841349909261451295]

$let[title;$getEmbed[841349909261451295;$message[1];title]]
$let[description;$getEmbed[841349909261451295;$message[1];description]]
$let[footer;$getEmbed[841349909261451295;$message[1];footer]]

$argsCheck[>1;{execute:args}]

$setGlobalUserVar[last_cmd;$commandName]
$onlyForIDs[$botOwnerID;{execute:owneronly}]
  `}