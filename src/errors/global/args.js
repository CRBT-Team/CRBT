const { emojis, colors } = require("../../../index");

module.exports.awaitedCommand = {
    name: "args",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}
{field:$get[correct-$getGlobalUserVar[language]]:
\`\`\`
$getServerVar[prefix]$getGlobalUserVar[lastCmd] $commandInfo[$getGlobalUserVar[lastCmd];usage_$getGlobalUserVar[language]]\`\`\`
:yes}
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} Wrong usage of the command.]
$let[correct-enUS;Correct usage#COLON#]

$let[title-enUK;${emojis.general.error} Incorrect usage!]
$let[correct-enUK;Please use#COLON#]

$let[title-esES;${emojis.general.error} ¡Uso incorrecto!]
$let[correct-esES;Por favor, usa#COLON#]

$let[title-frFR;${emojis.general.error} Mauvaise utilisation de la commande.]
$let[correct-frFR;Bonne utilisation#COLON#]

$let[title-ptBR;${emojis.general.error} Sintaxe incorreta do comando.]
$let[correct-ptBR;Sintaxe correta#COLON#]

$let[title-ru;${emojis.general.error} Неправильное использование команды.]
$let[correct-ru;Пример правильного использования#COLON#]
    `}