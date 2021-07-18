const { colors, emojis, links } = require("../../../index");

module.exports.awaitedCommand = {
    name: "partnerNotSale",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} Only for CRBT Partners!]
$let[description-enUS;This badge isn't accessible through the store... To get it, you can ask Clembs on the [Discord server](${links.info.discord})!]
    `}