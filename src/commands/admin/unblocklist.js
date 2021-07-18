const { emojis, links, colors } = require("../../../index");

module.exports.command = {
    name: "unblocklist",
    aliases: ["unbl", "ubl"],
    module: "admin",
    code: `
$sendDM[$findUser[$message[1];no];
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
{description:<@!$findUser[$message[1];no]> has been unblocklisted.}
{color:${colors.success}}
;no]

$setGlobalUserVar[blocklisted;false;$findUser[$message[1];no]]

$onlyIf[$findUser[$message[1];no]!=undefined;can't find this user]

$onlyForIDs[327690719085068289;$botOwnerID;{execute:owneronly}]
    `}