const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "userBlocklisted",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} The user is blocklisted!]
$let[description-enUS;This user was blocklisted from using $username[$clientID], and you can't interact with blocklisted users.]
    `}