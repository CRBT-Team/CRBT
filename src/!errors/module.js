const emojis = require('../../json/emojis.json');
const links = require('../../json/links.json');
const colors = require('../../json/colors.json');

module.exports.awaitedCommand = {
    name: "module",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}
$if[$hasPerms[$authorID;admin]==true]
{description:$get[description1-$getGlobalUserVar[language]]}
$else
{description:$get[description2-$getGlobalUserVar[language]]}
$endif
{color:${colors.red}}
;no]

$let[title-enUS;${emojis.general.error} This command belongs to a currently disabled module.]
$let[description1-enUS;To enable it, use \`$getServerVar[prefix]module +$commandInfo[$getGlobalUserVar[last_cmd];module]\`]
$let[description2-enUS;Ask an administrator to enable it with \`$getServerVar[prefix]module +$commandInfo[$getGlobalUserVar[last_cmd];module]\`]

$let[title-enUK;${emojis.general.error} Sorry!]
$let[description1-enUK;This command belongs to the $commandInfo[$getGlobalUserVar[last_cmd];module] module which is currently disabled on this server. To enable it, use \`$getServerVar[prefix]module +$commandInfo[$getGlobalUserVar[last_cmd];module]\`]
$let[description2-enUK;This command belongs to the $commandInfo[$getGlobalUserVar[last_cmd];module] module which is currently disabled on this server. Please ask a server administrator to enable this module with \`$getServerVar[prefix]module +$commandInfo[$getGlobalUserVar[last_cmd];module]\`]

$let[title-esES;${emojis.general.error} ¡Perdona!]
$let[description1-esES;Este comando pertenece al módulo $commandInfo[$getGlobalUserVar[last_cmd];module] que está actualmente deshabilitado en el servidor. Para habilitarlo, utiliza \`$getServerVar[prefix]module +$commandInfo[$getGlobalUserVar[last_cmd];module]\`]
$let[description2-esES;Ask an administrator to enable it with \`$getServerVar[prefix]module +$commandInfo[$getGlobalUserVar[last_cmd];module]\`]

$let[title-frFR;${emojis.general.error} Cette commande fait partie d'un module actuellement désactivé.]
$let[description1-frFR;Pour l'activer, utilisez \`$getServerVar[prefix]module +$commandInfo[$getGlobalUserVar[last_cmd];module]\`]
$let[description2-frFR;Demandez à un administrateur du serveur de l'activer avec \`$getServerVar[prefix]module +$commandInfo[$getGlobalUserVar[last_cmd];module]\`]

$let[title-ptBR;${emojis.general.error} Esse comando faz parte de um módulo que está desativado.]
$let[description1-ptBR;Para reativar o módulo, use o comando \`$getServerVar[prefix]module +$commandInfo[$getGlobalUserVar[last_cmd];module]\`]
$let[description2-ptBR;Contate um administrador para reativá-lo com o comando \`$getServerVar[prefix]module +$commandInfo[$getGlobalUserVar[last_cmd];module]\`]

$let[title-ru;${emojis.general.error} Эта команда принадлежит отключенному модулю.]
$let[description1-ru;Для включения модуля используйте команду \`$getServerVar[prefix]module +$commandInfo[$getGlobalUserVar[last_cmd];module]\`]
$let[description2-ru;Свяжитесь с администратором сервера для того, чтобы включить это командой \`$getServerVar[prefix]module +$commandInfo[$getGlobalUserVar[last_cmd];module]\`]
    `}