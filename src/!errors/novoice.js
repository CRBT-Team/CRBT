const emojis = require('../../json/emojis.json');
const links = require('../../json/links.json');
const colors = require('../../json/colors.json');

module.exports.awaitedCommand = {
    name: "novoice",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.red}}
;no]

$let[title-enUS;${emojis.general.error} Beep boop, you there?]
$let[description-enUS;You need to be part of a voice channel in order to play music/use this command.]

$let[title-enUK;${emojis.general.error} Ring ring. Anyone there?]
$let[description-enUK;You need to be a part of a voice channel in order to play music/use this command.]

$let[title-esES;${emojis.general.error} ¡Toc toc! ¿Alguien ahí?]
$let[description-esES;Necesitas estar en un canal de voz para reproducir música o usar este comando.]

$let[title-frFR;${emojis.general.error} Ouho, y'a quelqu'un ?]
$let[description-frFR;Vous devez être dans un salon vocal pour écouter de la musique ou utiliser cette commande]

$let[title-ptBR;${emojis.general.error} Beep boop, you there?]
$let[description-ptBR;You need to be part of a voice channel in order to play music/use this command.]

$let[title-ru;${emojis.general.error} Бип-буп, вы здесь?]
$let[description-ru;Вам необходимо быть в голосовом канале для проигрывания музыки/использования этой команды.]
    `}