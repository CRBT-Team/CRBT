const { emojis, colors } = require("../../../index");

module.exports.awaitedCommand = {
    name: "unknownItem",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} We searched far and wide.]
$let[description-enUS;I couldn't find this item... Use \`$getServerVar[prefix]store\` to get a list of all currently available items.]
    `}