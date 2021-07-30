const { colors, emojis, links } = require("../../../index");

module.exports.awaitedCommand = {
    name: "itemInInv",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} Ever get that feeling of déjà vu?]
$let[description-enUS;You already own this item! To use it, you can use \`$getServerVar[prefix]$toLowercase[$message]\`.]
    `}