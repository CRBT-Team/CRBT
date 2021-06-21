const { emojis, colors } = require("../../index");

module.exports.awaitedCommand = {
    name: "nsfw",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} Getting a lil' excited, aren't we?]
$let[description-enUS;You can only access NSFW commands inside of NSFW-flagged channels.]

$let[title-enUK;${emojis.general.error} Calm down calm down!]
$let[description-enUK;You aren't allowed to access NSFW commands outside of non-NSFW flagged channels.]

$let[title-esES;${emojis.general.error} ¡Tranquilízate!]
$let[description-esES;Sólo puedes usar comandos NSFW dentro de canales marcados como NSFW.]

$let[title-frFR;${emojis.general.error} On est déjà si excité ?]
$let[description-frFR;Vous ne pouvez utiliser les commandes NSFW (Not Safe For Work, contenu adulte) que dans les salons NSFW.]

$let[title-ptBR;${emojis.general.error} Getting a lil' excited, aren't we?]
$let[description-ptBR;You can only access NSFW commands inside of NSFW-flagged channels.]

$let[title-ru;${emojis.general.error} Хотите повеселиться, не так ли?]
$let[description-ru;Вы можете получить доступ к NSFW-командам только в каналах с пометкой NSFW.]
    `}