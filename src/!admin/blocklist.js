const { emojis, links } = require("../../index");

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
Blocklisted from CRBT.
:no}
{field:Message from $userTag:
$messageSlice[1]
:no}
{footer:You can't reply back to a CRBT message.}
{color:${colors.red}}
]

$reply[$messageID;
{title:${emojis.general.success} Blocklist successful}
{description:<@!$findUser[$message[1];no]> has been blocklisted.}
{field:Reason:
$messageSlice[1]
:yes}
{color:${colors.red}}
;no]

$setGlobalUserVar[blacklisted;true;$findUser[$message[1];no]]

$onlyIf[$findUser[$message[1];no]!=undefined;can't find this user]

$onlyForIDs[327690719085068289;$botOwnerID;{execute:owneronly}]
`}