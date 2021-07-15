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
$let[description-enUS;You will need the $replaceText[$get[perms-enUS];\n;] permission(s) to execute this command.]

$let[perms-enUS;
$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[
$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[
$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[
$get[perms]
;manageemojis;"Manage Emojis and Stickers"]
;manageserver;"Manage Server"]
;managemessages;"Manage Messages"]
;sendmessages;"Send Messages"]
;manageroles;"Manage roles"]

;createinvite;"Create Invite"]
;kick;"Kick Members"]
;ban;"Ban Members"]
;managechannels;"Manage Channels"]
;addreactions;"Add Reactions"]

;connect;"Connect"]
;speak;"Speak"]
;managewebhooks;"Manage Webhooks"]
;admin;"Administrator"]
;externalemojis;"Use External Emojis"]
]

$let[perms;$replaceText[$commandInfo[$getGlobalUserVar[lastCmd];userPerms];,;, ]]
    `}