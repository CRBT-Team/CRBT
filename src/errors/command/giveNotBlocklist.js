const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "giveNotBlocklist",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} The user is blocklisted!]
$let[description-enUS;The user you're trying to give Purplets to is currently blocklisted, so it'll be unecessary to give them Purplets.]
    `}