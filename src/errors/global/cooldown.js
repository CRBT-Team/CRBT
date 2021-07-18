const { emojis, colors } = require("../../../index");

module.exports.awaitedCommand = {
    name: "cooldown",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} Hold it!]
$let[description-enUS;You'll be able to use this command again in $get[time].]

$let[title-enUK;${emojis.error} Hold up!]
$let[description-enUK;You'll be able to use this command again in $get[time].]

$let[title-esES;${emojis.error} ¡Un momento!]
$let[description-esES;Podrás volver a usar este comando en $get[time].]

$let[title-frFR;${emojis.error} Un instant !} 
$let[description-frFR;Vous ne pourrez réutiliser cette commande que dans $replaceText[$replaceText[$get[time];hours;heures];seconds;secondes].]

$let[title-ru;${emojis.error} Погодите!] 
$let[description-ru;Чтобы использовать эту команду снова, вам нужно подождать ещё $get[time].]

$if[$getGlobalUserVar[lastCmd]==work]
    $let[time;$getCooldownTime[$getObjectProperty[cooldown]m;globalUser;work;$authorID]]
$djsEval[const { jobs } = require("../../../../../index");
const tools = require("dbd.js-utils");
d.object.cooldown = jobs["$getObjectProperty[job]"]["$getObjectProperty[level]"].cooldown]
$createObject[{"job":"$getGlobalUserVar[job_type]", "level":"level$getGlobalUserVar[job_level]"}]

$else
    $let[time;$getCooldownTime[$commandInfo[$getGlobalUserVar[lastCmd];cooldown];globalUser;$getGlobalUserVar[lastCmd];$authorID]]
$endif
    `}