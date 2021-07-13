const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "alreadyPublished",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} Nice... I guess?]
$let[description-enUS;This channel is already part of the auto-publish module.]
    `}