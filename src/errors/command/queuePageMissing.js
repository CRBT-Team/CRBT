const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "queuePageMissing",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} Too far!!]
$let[description-enUS;We couldn't reach this page of the queue, likely due to its non-existance!]
    `}