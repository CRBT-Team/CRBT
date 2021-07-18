const { emojis, colors } = require("../../../index");

module.exports.awaitedCommand = {
    name: "owneronly",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} You don't have access to this command.]
$let[description-enUS;You seem to have executed a command that only Clembs $replaceText[$replaceText[$checkCondition[$botOwnerID==327690719085068289];false;and $username[$botOwnerID]];true;] can execute.]

$let[title-enUK;${emojis.error} Sorry!]
$let[description-enUK;You cannot execute this command as it has been locked to Clembs!]

$let[title-esES;${emojis.error} No tienes acceso a este comando.]
$let[description-esES;Este comando solo puede ser ejecutado por Clembs.]

$let[title-frFR;${emojis.error} Vous n'avez pas accès à cette commande.]
$let[description-frFR;You seem to have executed a command that only Clembs can execute.]

$let[title-ptBR;${emojis.error} Você não tem acesso a esse comando.]
$let[description-ptBR;Parece que você executou um comando que apenas Clembs pode executar.]

$let[title-ru;${emojis.error} You don't have access to this command.]
$let[description-ru;You seem to have executed a command that only Clembs can execute.]
    `}