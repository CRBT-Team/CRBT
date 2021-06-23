const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "giveNotBots",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} Bleep-bloop. Can't Give To Robot.]
$let[description-enUS;To avoid throwing your Purplets and never getting them back, you can't give Purplets to bots!]
    `}