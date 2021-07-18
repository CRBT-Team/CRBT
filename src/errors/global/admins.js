const { emojis, colors } = require("../../../index");

module.exports.awaitedCommand = {
    name: "admins",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} You don't have enough permissions.]
$let[description-enUS;You need to have the "Manage server" or "Administrator" permission in order to execute that command.]

$let[title-enUK;${emojis.error} Sorry!]
$let[description-enUK;You do not have the correct permissions to run this command. You need to either be a server administrator or manager to execute this command!]

$let[title-esES;${emojis.error} No tienes suficientes permisos.]
$let[description-esES;Debes tener el permiso de "Gestionar servidor" o de "Administrador" para ejecutar este comando.]

$let[title-frFR;${emojis.error} Vous n'avez pas les permissions requises.]
$let[description-frFR;Vous devez être administrateur ou pouvoir gérer le serveur pour utiliser cette commande.]

$let[title-ptBR;${emojis.error} Você não tem as permissões requeridas para esse comando.]
$let[description-ptBR;Você precisa ter permissões para Gerenciar o servidor ou permissões de Administrador para executar esse comando.]

$let[title-ru;${emojis.error} У вас недостаточно прав для использования данной команды.]
$let[description-ru;Вы должны быть администратором сервера для этого.]
    `}