const { colors, emojis, links } = require("../../../index");

module.exports.awaitedCommand = {
    name: "modAlready",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} Woops!]
$let[description-enUS;This user is already $replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[
$getGlobalUserVar[lastCmd]F
;banF;banned]
;unbanF;not banned]
;kickF;not on the server]
;unmuteF;unmuted or not on the server]
;muteF;muted or not on the server]
;\n;].]
    `}