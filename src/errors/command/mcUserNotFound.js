const { emojis, colors } = require("../../../index");

module.exports.awaitedCommand = {
    name: "mcUserNotFound",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} Couldn't find that player!]
$let[description-enUS;Make sure to include a valid Minecraft Java Edition player name, and not a UUID or Minecraft Bedrock player name.]
    `}