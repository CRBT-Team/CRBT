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
$let[description-enUS;I need the $replaceText[$get[perms-enUS];\n;] permission(s) in order to get this command to work.]

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

$let[perms;$replaceText[$commandInfo[$getGlobalUserVar[lastCmd];botPerms];,;, ]]
    `}