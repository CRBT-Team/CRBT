const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "tooShort",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} Too short!]
$let[description-enUS;Your profile $replaceText[$getGlobalUserVar[lastCmd];set;] should at least be $replaceText[$replaceText[$getGlobalUserVar[lastCmd];setbio;10];setname;5] characters in length.]
    `}