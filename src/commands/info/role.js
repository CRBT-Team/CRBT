const { colors } = require("../../../index");

module.exports.command = {
    name: "roleinfo",
    aliases: ["role", "ri", "role-info", "role_info"],
    module: "info",
    description_enUS: "Gives information on a specified role.",
    usage_enUS: "<role name | role ID | @role>",
    code: `
$reply[$messageID;

{author:$get[title-$getGlobalUserVar[language]]}

{field:$get[id-$getGlobalUserVar[language]]:no}
{field:$get[members-$getGlobalUserVar[language]]:yes}
{field:$get[color-$getGlobalUserVar[language]]:yes}
{field:$get[position-$getGlobalUserVar[language]]:yes}
{field:$get[creation-$getGlobalUserVar[language]]:no}
{field:$get[hoisted-$getGlobalUserVar[language]]:yes}
{field:$get[mention-$getGlobalUserVar[language]]:yes}
{field:$get[managed-$getGlobalUserVar[language]]:yes}
{field:$get[perms-$getGlobalUserVar[language]]:no}

$if[$role[$get[id];hex]!=000000]

{thumbnail:http://localhost:15019/other/color/$role[$get[id];hex]}

$endif

{color:$get[color]}

;no]


$let[title-enUS;$replaceText[$replaceText[$role[$get[id];name];#LEFT_BRACKET#;#LEFT_BRACKET#];#COLON#;#COLON#] - Role info]
$let[id-enUS;ID:$get[id]]
$let[members-enUS;Members:$roleMembersCount[$get[id]]]
$let[color-enUS;Color:$replaceText[$replaceText[$checkCondition[$role[$get[id];hex]==000000];true;None];false;#$role[$get[id];hex]]]
$let[position-enUS;Position:$rolePosition[$get[id]] out of $roleCount roles]
$let[creation-enUS;Added:<t:$formatDate[$role[$get[id];created];X]> (<t:$formatDate[$role[$get[id];created];X]:R>)]
$let[hoisted-enUS;Hoisted:$replaceText[$replaceText[$isHoisted[$get[id]];true;Yes];false;No]]
$let[mention-enUS;Mentionable:$replaceText[$replaceText[$isMentionable[$get[id]];true;Yes];false;No]]
$let[managed-enUS;Managed:$replaceText[$replaceText[$role[$get[id];ismanaged];true;Yes];false;No]]
$let[perms-enUS;Permissions:$replaceText[$replaceText[$checkContains[$rolePerms[$get[id]; ];Administrator];true;Administrator (all permissions)];false;$replaceText[$replaceText[$checkCondition[$rolePerms[$get[id]; ]==];true;None];false;$rolePerms[$get[id];, ]]]]

$let[color;$replaceText[$role[$get[id];hex];000000;${colors.blurple}]]

$onlyIf[$get[id]!=;{execute:queryNotFound}]
$let[id;$findRole[$message]]

$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}