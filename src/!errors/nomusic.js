const emojis = require('../../json/emojis.json');
const links = require('../../json/links.json');
const colors = require('../../json/colors.json');

module.exports.awaitedCommand = {
    name: "nomusic",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.red}}
;no]

$let[title-enUS;${emojis.general.error} \*sad trumpet noises\*}
$let[description-enUS;It looks like there isn't anything playing at the moment, try to add music with \`$getServerVar[prefix]$getServerVar[prefix]play $commandInfo[play;usage_$getGlobalUserVar[language]]\`]

$let[title-enUK;${emojis.general.error} \*Sad trumpet noises.\*}
$let[description-enUK;It looks like there isnt anything at the moment! Try to add music to the queue by using \`$getServerVar[prefix]$getServerVar[prefix]play $commandInfo[play;usage_$getGlobalUserVar[language]]\`!]

$let[title-esES;${emojis.general.error} \*sonidos tristes de trompeta\*}
$let[description-esES;¡Parece que no hay nada ahora mismo! Prueba a añadir música a la lista usando \`$getServerVar[prefix]$getServerVar[prefix]play $commandInfo[play;usage_$getGlobalUserVar[language]]\`]

$let[title-frFR;${emojis.general.error} \*bruit de trompette triste\*}
$let[description-frFR;On dirait que rien n'est joué actuellement, essayez d'ajouter de la musique avec \`$getServerVar[prefix]$getServerVar[prefix]play $commandInfo[play;usage_$getGlobalUserVar[language]]\`]

$let[title-ptBR;${emojis.general.error} \*sad trumpet noises\*}
$let[description-ptBR;It looks like there isn't anything playing at the moment, try to add music with \`$getServerVar[prefix]$getServerVar[prefix]play $commandInfo[play;usage_$getGlobalUserVar[language]]\`]

$let[title-ru;${emojis.general.error} \*Грустные звуки тромбона\*}
$let[description-ru;Видимо, здесь сейчас ничего не играет. Вы можете добавить музыку, используя команду \`$getServerVar[prefix]$getServerVar[prefix]play $commandInfo[play;usage_$getGlobalUserVar[language]]\`]
    `}