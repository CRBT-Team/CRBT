const { colors, emojis, links } = require("../../../index");

module.exports.awaitedCommand = {
    name: "specialItem",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} Yikes!]
$let[description-enUS;Unfortunately, this item is sold out or isn't available for purchase...]
    `}