const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "snipeEmpty",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} The snipe slot there is empty!]
$let[description-enUS;I couldn't find any recently deleted messages in <#$findServerChannel[$message]>.\nNote: I can't fetch deleted messages inside channels I can't access. Make sure I have the "View Channel" permissions there.]
    `}