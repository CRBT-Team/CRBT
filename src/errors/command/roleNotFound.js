const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "roleNotFound",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} Couldn't find this role.]
$let[description-enUS;Through all of the roles on the server, this one doesn't seem to exist. Try to use an ID or by mentioning the role.]
    `}