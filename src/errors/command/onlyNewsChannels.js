const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "onlyNewsChannels",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} This ain't it chief!]
$let[description-enUS;You can only set announcement channels to be auto-published.]
    `}