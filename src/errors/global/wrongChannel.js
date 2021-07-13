const { emojis, colors } = require("../../../index");

module.exports.awaitedCommand = {
    name: "wrongChannel",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} This command can't be used here!]
$let[description-enUS;$username[$clientID] is bounded to <#$getServerVar[music_channel]>, which means you can only use this command here.]
    `}