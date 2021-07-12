const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "invitePerms",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{footer:$get[footer-$getGlobalUserVar[language]]}
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} There's something missing...]
$let[description-enUS;I need the "Create Invite" permission on this voice channel in order to create activities!]
    `}