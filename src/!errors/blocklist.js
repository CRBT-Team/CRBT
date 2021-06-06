const { emojis, links, colors } = require("../../index");

module.exports.awaitedCommand = {
    name: "blocklist",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.red}}
;no]

$let[title-enUS;${emojis.general.error} You were blocklisted!]
$let[description-enUS;Ask Clembs to get unblocklisted on the [Discord server](${links.info.discord}).]

$let[title-enUK;${emojis.general.error} Sorry!]
$let[description-enUK;You've been blocklisted from using $username[$clientID] by Clembs! You can appeal this on the [Support Discord server](${links.info.discord})]

$let[title-esES;${emojis.general.error} ¡Perdona!]
$let[description-esES;Clembs te ha impedido el uso de $username[$clientID]. Puedes apelarlo en el [Servidor de Discord de soporte](${links.info.discord}).]

$let[title-frFR;${emojis.general.error} Votre accès a été suspendu !]
$let[description-frFR;Demandez à Clembs pour être débloqué sur le [serveur Discord](${links.info.discord})]

$let[title-ptBR;${emojis.general.error} Você foi bloqueado!]
$let[description-ptBR;Contate Clembs#2925 no [Servidor do Discord](${links.info.discord}) para ser desbloqueado.]

$let[title-ru;${emojis.general.error} Вы были заблокированы!]
$let[description-ru;Свяжитесь с Clembs для разблокировки на [Дискорд сервере](${links.info.discord})]
    `}