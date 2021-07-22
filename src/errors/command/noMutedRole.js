const { colors, emojis, links } = require("../../../index");

module.exports.awaitedCommand = {
    name: "noMutedRole",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} Well that's awkward...]
$let[description-enUS;No muted role was set to be given or the role was deleted. You can either create one with \`$getServerVar[prefix]mutedrole\` or if you already have one, set it with \`$getServerVar[prefix]mutedrole <@role>\`.]
    `}