const { emojis, colors, links } = require("../../../index");

module.exports.awaitedCommand = {
    name: "generic",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}
{description:$get[description-$getGlobalUserVar[language]]}
{color:${colors.error}}
;no]
$let[title-enUS;${emojis.error} Yikes! A generic error message!]
$let[description-enUS;An error has occurred. Please try again later or \`$getServerVar[prefix]report\` this error. Make sure to include the command name and arguments, and a screenshot of the context, if possible.]
    `}