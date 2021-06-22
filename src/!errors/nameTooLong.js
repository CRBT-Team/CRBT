const { colors, emojis } = require("../../index");

module.exports.awaitedCommand = {
    name: "nameTooLong",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA]
$let[description-enUS;Your profile name should not surpass 40 characters in length, including interpreted CRBTscript tags.]
    `}