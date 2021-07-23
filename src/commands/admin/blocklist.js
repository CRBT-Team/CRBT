const { emojis, links, colors } = require("../../../index");

module.exports.command = {
    name: "blocklist",
    description_enUS: "Blocklists a user from using <botname>.",
    usage_enUS: "<user ID | @mention>",
    aliases: ["bl"],
    module: "admin",
    code: `
$sendDM[$get[id];
{title:${emojis.information} You've got mail!}
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
{color:${colors.error}}
]

$reply[$messageID;
{title:${emojis.success} Blocklist successful}
{description:<@!$get[id]> has been blocklisted.}
$if[$messageSlice[1]!=]
{field:Reason:
$messageSlice[1]
:yes}
$endif
{color:${colors.success}}
;no]

$onlyIf[$userExists[$get[id]]==true;{execute:usernotfound}]

$let[id;$replaceText[$replaceText[$replaceText[$message[1];<@!;];<@;];>;]]

$onlyForIDs[327690719085068289;$botOwnerID;{execute:owneronly}]
  `}