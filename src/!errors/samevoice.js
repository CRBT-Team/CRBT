const { emojis, colors } = require("../../index");

module.exports.awaitedCommand = {
    name: "samevoice",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]
$replaceText[$replaceText[$hasPermsInChannel[$voiceID[$clientID];$authorID;connect];true;$get[true-$getGlobalUserVar[language];false;$get[false-$getGlobalUserVar[language]]}
{color:${colors.red}}
;no]

$let[title-enUS;${emojis.general.error} Code 403: Access denied.]
$let[description-enUS;Woops, you need to be in the same voice channel as $username[$clientID] to use this command.]
$let[true-enUS;Click <#$voiceID[$clientID]> to join the correct channel.]
$let[false-enUS;Maybe ask a moderator politely to grant you access to the voice channel where $username[$clientID] is playing.]

$let[title-enUK;${emojis.general.error} Code 403, access denied.]
$let[description-enUK; You need to be in the same voice channel as $username[$clientID] to use this command.]
$let[true-enUK;Click <#$voiceID[$clientID]> to join!]
$let[false-enUK;Hmm. You cant access the channel? You could try asking a moderator *(politely)* to grant you permission to join $username[$clientID] in <#$voiceID[$clientID]>.]

$let[title-esES;${emojis.general.error} Código 403: Acceso denegado.]
$let[description-esES; ¡Ups! Necesitas estar en el mismo canal de voz que $username[$clientID] para usar este comando.]
$let[true-esES;Haz clic aquí: <#$voiceID[$clientID]> para unirte al canal correcto.]
$let[false-esES;No tienes acceso al canal. Quizá pídele acceso al canal de voz, donde $username[$clientID] está reproduciendo música, a un moderador, respetuosamente.]

$let[title-frFR;${emojis.general.error} Code 403: Accès refusé.]
$let[description-frFR;Oups, vous devez être dans le même salon vocal que $username[$clientID] pour utiliser cette commande.]
$let[true-frFR;Cliquez sur <#$voiceID[$clientID]> pour rejoindre le salon actuel.]
$let[false-frFR;Vous pouvez essayer de demander poliment à un modérateur de vous donner l'accès au salon vocal où $username[$clientID] joue.]

$let[title-ptBR;${emojis.general.error} Code 403: Access denied.]
$let[description-ptBR;Woops, you need to be in the same voice channel as $username[$clientID] to use this command.]
$let[true-ptBR;Click <#$voiceID[$clientID]> to join the correct channel.]
$let[false-ptBR;Maybe ask a moderator politely to grant you access to the voice channel where $username[$clientID] is playing.]

$let[title-ru;${emojis.general.error} Ошибка 403: Доступ запрещён.]
$let[description-ru;Упс, вам необходимо находиться в том же голосовом канале, что и $username[$clientID] для использования этой команды.]
$let[true-ru;Нажмите на <#$voiceID[$clientID]>, чтобы оказаться в нужном голосовом канале.]
$let[false-ru;Вежливо попросите модератора предоставить вам доступ к тому же голосовому каналу, где играет $username[$clientID].]
    `}