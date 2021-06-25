const { emojis, colors } = require("../../../index");

module.exports.awaitedCommand = {
    name: "prefixTooLong",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} Too long!]
$let[description-enUS;For the sake of simplicity, you can't have a prefix that's more than 15 characters long!]
    `}