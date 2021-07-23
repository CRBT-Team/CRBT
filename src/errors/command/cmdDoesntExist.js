const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "cmdDoesntExist",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{footer:$get[footer-$getGlobalUserVar[language]]}
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} Huh?]
$let[description-enUS;Looks like this command or module doesn't exist. Make sure to check your spelling. To check a list of all available modules, use \`$getServerVar[prefix]help\`.]
    `}