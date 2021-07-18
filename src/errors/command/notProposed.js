const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "notProposed",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} This job wasn't proposed or doesn't exist!]
$let[description-enUS;Check your spelling and the \`$getServerVar[prefix]jobsearch\` command to get the available jobs for you.]
    `}