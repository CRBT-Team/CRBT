const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "channelNotFound",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} Couldn't find this channel.]
$let[description-enUS;I couldn't find \`$message\` in this server. Try again by mentioning the channel (#<channel name>) or by using its ID.]
    `}