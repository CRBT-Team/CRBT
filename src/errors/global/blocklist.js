const { emojis, links, colors } = require("../../../index");

module.exports.awaitedCommand = {
    name: "blocklist",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} You were blocklisted!]
$let[description-enUS;Ask Clembs to get unblocklisted on the [Discord server](${links.discord}).]

$let[title-enUK;${emojis.error} Sorry!]
$let[description-enUK;You've been blocklisted from using $username[$clientID] by Clembs! You can appeal this on the [Support Discord server](${links.discord})]

$let[title-esES;${emojis.error} ¡Perdona!]
$let[description-esES;Clembs te ha impedido el uso de $username[$clientID]. Puedes apelarlo en el [Servidor de Discord de soporte](${links.discord}).]

$let[title-frFR;${emojis.error} Votre accès a été suspendu !]
$let[description-frFR;Demandez à Clembs pour être débloqué sur le [serveur Discord](${links.discord})]

$let[title-ptBR;${emojis.error} Você foi bloqueado!]
$let[description-ptBR;Contate Clembs#2925 no [Servidor do Discord](${links.discord}) para ser desbloqueado.]

$let[title-ru;${emojis.error} Вы были заблокированы!]
$let[description-ru;Свяжитесь с Clembs для разблокировки на [Дискорд сервере](${links.discord})]
    `}