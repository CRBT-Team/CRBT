const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "noBadWords",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} Yikes!]
$let[description-enUS;Swear words, slurs, profanity and subjective topics are not welcomed in public fields like these.]

$let[title-enALT;${emojis.error} no badworde, even for joking]
    `}