const { emojis, links, colors } = require("../../../index");

module.exports.command = {
    name: "unblocklist",
    description_enUS: "Unblocklists a user from using <botname>.",
    usage_enUS: "<user ID | @mention>",
    aliases: ["unbl", "ubl"],
    module: "admin",
    code: `
$sendDM[$get[id];
{title:${emojis.information} You've got mail!}
{description:This message was delivered by a verified CRBT developer.
Learn more about CRBT messages **[here](${links.info.messages})**.
}
{field:Subject:
Unblocklisted from CRBT.
:no}
{footer:You can't reply back to a CRBT message.}
{color:${colors.success}}
]

$reply[$messageID;
{title:${emojis.success} Unblocklist successful}
{description:<@!$get[id]> has been unblocklisted.}
{color:${colors.success}}
;no]

$deleteGlobalUserVar[blocklisted;$get[id]]

$onlyIf[$userExists[$get[id]]==true;{execute:usernotfound}]

$let[id;$replaceText[$replaceText[$replaceText[$message[1];<@!;];<@;];>;]]

$onlyForIDs[327690719085068289;$botOwnerID;{execute:owneronly}]
    `}