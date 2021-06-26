const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "giveNotYou",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} Wait- that's incorrect]
$let[description-enUS;You can't give Purplets to yourself, surpringly enough.]
    `}