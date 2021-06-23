const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "belowZero",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{footer:$get[footer-$getGlobalUserVar[language]]}
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} oh...]
$let[description-enUS;You can't give a negative value of Purplets or... well, nothing.]
$let[footer-enUS;Pro tip: to give nothing, try to not type the command! (works 100% of the time)]
    `}