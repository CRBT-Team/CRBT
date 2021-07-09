const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "notOnProfile",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} Hmmm what...]
$let[description-enUS;This badge isn't on your profile!]
    `}