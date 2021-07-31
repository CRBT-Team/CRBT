const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "moduleFalse",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} Access Denied]
$let[description-enUS;You can't disable an essential module!]
    `}