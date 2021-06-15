const { emojis, links, colors } = require("../../index");

module.exports.command = {
  name: "blocklist",
  aliases: ["bl"],
  module: "admin",
  code: `
$sendDM[$findUser[$message[1];no];
{title:${emojis.general.information} You've got mail!}
{description:This message was delivered by a verified CRBT developer.
Learn more about official CRBT messages [here](${links.info.messages}).}
{field:Subject:
Blocklisted from CRBT. Appeal your blocklist [here](${links.info.discord}).
:no}
$if[$messageSlice[1]!=]
{field:Message from $userTag:
$messageSlice[1]
:no}
$endif
{footer:You can't reply back to a CRBT message.}
{color:${colors.red}}
]

$reply[$messageID;
{title:${emojis.general.success} Blocklist successful}
{description:<@!$findUser[$message[1];no]> has been blocklisted.}
$if[$messageSlice[1]!=]
{field:Reason:
$messageSlice[1]
:yes}
$endif
{color:${colors.cyan}}
;no]

$setGlobalUserVar[blocklisted;true;$findUser[$message[1];no]]

$onlyIf[$findUser[$message[1];no]!=undefined;can't find this user]

$onlyForIDs[327690719085068289;$botOwnerID;{execute:owneronly}]
`}