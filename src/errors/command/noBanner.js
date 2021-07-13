const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "noBanner",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} Woops!]
$let[description-enUS;You don't have any banner currently on your profile.]
    `}