const { emojis, colors } = require("../../../index");

module.exports.awaitedCommand = {
    name: "cooldown",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} Hold it!]
$let[description-enUS;You'll be able to use this command again in $getCooldownTime[$commandInfo[$getGlobalUserVar[last_cmd];cooldown];globalUser;$getGlobalUserVar[last_cmd];$authorID].]

$let[title-enUK;${emojis.general.error} Hold up!]
$let[description-enUK;You'll be able to use this command again in $getCooldownTime[$commandInfo[$getGlobalUserVar[last_cmd];cooldown];globalUser;$getGlobalUserVar[last_cmd];$authorID].]

$let[title-esES;${emojis.general.error} ¡Un momento!]
$let[description-esES;Podrás volver a usar este comando en $getCooldownTime[$commandInfo[$getGlobalUserVar[last_cmd];cooldown];globalUser;$getGlobalUserVar[last_cmd];$authorID].]

$let[title-frFR;${emojis.general.error} Un instant !} 
$let[description-frFR;Vous ne pourrez réutiliser cette commande que dans $replaceText[$replaceText[$getCooldownTime[$commandInfo[$getGlobalUserVar[last_cmd];cooldown];globalUser;$getGlobalUserVar[last_cmd];$authorID];hours;heures];seconds;secondes].]

$let[title-ru;${emojis.general.error} Погодите!] 
$let[description-ru;Чтобы использовать эту команду снова, вам нужно подождать ещё $getCooldownTime[$commandInfo[$getGlobalUserVar[last_cmd];cooldown];globalUser;$getGlobalUserVar[last_cmd];$authorID].]
    `}