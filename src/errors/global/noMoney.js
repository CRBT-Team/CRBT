const { links, emojis, colors, items } = require("../../../index");

module.exports.awaitedCommand = {
    name: "noMoney",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{field:$get[your-$getGlobalUserVar[language]]:yes}
$if[$getGlobalUserVar[lastCmd]==balance]

{field:$get[required-$getGlobalUserVar[language]]:yes} 
$let[required-enUS;Required:${emojis.general.purplet} **$getObjectProperty[value] Purplets**]
$djsEval[const { items } = require("../../../../../index");
d.object.value = items["$getObjectProperty[msg1]"]["$getObjectProperty[msg2]"].value;]
$createObject[{"msg1":"$toLowercase[$message[1]]s","msg2":"$toLowercase[$message[2]]"}]

$endif
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} You don't have enough Purplets!]
$let[your-enUS;Your current balance:${emojis.general.purplet} **$getGlobalUserVar[user_bank] Purplets**]
    `}