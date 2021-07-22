const { colors, emojis, links } = require("../../../index");

module.exports.awaitedCommand = {
    name: "modAlready",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} Woops!]
$let[description-enUS;This user is already $getGlobalUserVar[lastCmd]ed.]
    `}