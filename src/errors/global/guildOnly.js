const { links, emojis, colors, items } = require("../../../index");

module.exports.awaitedCommand = {
    name: "guildOnly",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]}
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} We don't belong here, $username.]
$let[description-enUS;This command unfortunately can't be executed from your DMs. Try again in a server this time or **[invite me](${links.invite.fullInvite})** to one of yours!]
    `}