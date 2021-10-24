const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "modNotFound",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} It felt like they were just there...]
$let[description-enUS;The user you are trying to $getGlobalUserVar[lastCmd] is not on the server.]
    `}