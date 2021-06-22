const { colors, emojis } = require("../../index");

module.exports.awaitedCommand = {
    name: "bioTooLong",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} NOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO]
$let[description-enUS;Your profile bio should not surpass 120 characters in length, including interpreted CRBTscript tags.]
    `}