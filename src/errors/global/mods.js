const { emojis, colors } = require("../../../index");

module.exports.awaitedCommand = {
    name: "mods",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} You don't have enough permissions.]
$let[description-enUS;To use this command, you'll need to either be able to manage messages, to manage the server or to have a role containing the "CRBT Mod" keyword.]

$let[title-enUK;${emojis.error} Sorry!]
$let[description-enUK;You either need to br able to kick members, to manage the server or have a role containing the keyword "CRBT Mod".]

$let[title-esES;${emojis.error} No tienes suficientes permisos.]
$let[description-esES;Para utilizar este comando, necesitarás tener permiso para expulsar miembros o administrar el servidor o tener un rol que contenga la palabra clave "CRBT Mod".]

$let[title-frFR;${emojis.error} Vous n'avez pas les permissions requises.]
$let[description-frFR;Vous devez pouvoir expulser des membres, gérer le serveur ou avoir un rôle contenant le mot clé "CRBT Mod".]

$let[title-ptBR;${emojis.error} Você não tem as permissões requeridas para esse comando.]
$let[description-ptBR;Você precisa ter permissão para expulsar membros, gerenciar o servidor ou ter um cargo com o nome "CRBT Mod".]

$let[title-ru;${emojis.error} У вас недостаточно прав.]
$let[description-ru;Чтобы использовать данную команду, вам необходимо иметь либо возможность выгонять участников или управлять сервером, либо вы должны иметь роль с ключевым словом "CRBT Mod".]
    `}