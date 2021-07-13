const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "botPerms",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} I don't have enough permissions.]
$let[description-enUS;I need the $replaceText[$replaceText[$replaceText[$get[perms];manageemojis;"Manage emojis"];manageserver;"Manage server"];managemessages;"Manage messages"] permission(s) in order to get this command to work.]

$let[perms;$replaceText[$commandInfo[$getGlobalUserVar[lastCmd];botPerms];,;, ]]
    `}