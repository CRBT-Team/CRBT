const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "alreadyOnProfile",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} Ohhhh...]
$let[description-enUS;Bad news: Error message!\nGood news: This badge is already on your profile!]
    `}