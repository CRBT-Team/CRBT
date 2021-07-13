const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "userPerms",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} You don't have the required permissions.]
$let[description-enUS;You will need the $replaceText[$replaceText[$replaceText[$get[perms];manageemojis;"Manage emojis"];manageserver;"Manage server"];managemessages;"Manage messages"] permission(s) to execute this command.]

$let[perms;$replaceText[$commandInfo[$getGlobalUserVar[lastCmd];userPerms];,;, ]]
    `}