const { emojis, colors } = require("../../index");

module.exports.awaitedCommand = {
    name: "owneronly",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.red}}
;no]

$let[title-enUS;${emojis.general.error} You don't have access to this command.]
$let[description-enUS;You seem to have executed a command that only Clembs can execute.]

$let[title-enUK;${emojis.general.error} Sorry!]
$let[description-enUK;You cannot execute this command as it has been locked to Clembs!]

$let[title-esES;${emojis.general.error} No tienes acceso a este comando.]
$let[description-esES;Este comando solo puede ser ejecutado por Clembs.]

$let[title-frFR;${emojis.general.error} Vous n'avez pas accès à cette commande.]
$let[description-frFR;You seem to have executed a command that only Clembs can execute.]

$let[title-ptBR;${emojis.general.error} Você não tem acesso a esse comando.]
$let[description-ptBR;Parece que você executou um comando que apenas Clembs pode executar.]

$let[title-ru;${emojis.general.error} You don't have access to this command.]
$let[description-ru;You seem to have executed a command that only Clembs can execute.]
    `}