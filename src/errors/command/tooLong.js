const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "tooLong",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} Too long!]
$let[description-enUS;Your profile $replaceText[$getGlobalUserVar[lastCmd];set;] should not surpass $replaceText[$replaceText[$getGlobalUserVar[lastCmd];setbio;120];setname;40] characters in length, including interpreted CRBTscript tags.]
    `}