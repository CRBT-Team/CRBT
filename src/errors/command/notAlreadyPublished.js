const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "notAlreadyPublished",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} Neat... I hope?]
$let[description-enUS;This channel is already not part of the auto-publish module.]
    `}