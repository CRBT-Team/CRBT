const { emojis, colors } = require("../../../index");

module.exports.awaitedCommand = {
    name: "unknownError",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} An unknown error happened.]
$let[description-enUS;Please use the \`$getServerVar[prefix]report\` command with the command name and options you used so we can understand this error and try to fix it.]
    `}