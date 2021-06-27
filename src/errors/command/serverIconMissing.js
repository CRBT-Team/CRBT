const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "serverIconMissing",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} Missing server icon]
$let[description-enUS;This server apparently doesn't have a server icon... so I can't quite display it.]
    `}