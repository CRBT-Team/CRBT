const {illustrations,colors,emojis} = require("../../../index");

module.exports.command = {
    name: "module",
    description_enUS: "Lists all available modules, or disables/enables any if specified",
    usage_enUS: "<enable | + | - | disable (optional)> <module name (optional)>",
    examples_enUS: [
        "modules",
        "module enable message logs",
        "cfg remove Moderation",
        "md +autopublish"
    ],
    module: "settings",
    aliases: ["modules", "config", "cfg", "md"],
    userPerms: "manageserver",
    code: `
$if[$message==]

$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]:${illustrations.settings}}

{description:$get[modules-$getGlobalUserVar[language]]}

{field:$get[essentials-$getGlobalUserVar[language]]}

{color:$getGlobalUserVar[color]}
;no]


$elseIf[$checkContains[$stringStartsWith[$toLowercase[$message];+]$stringStartsWith[$toLowercase[$message];enable ]$stringStartsWith[$toLowercase[$message];add ];true]==true]

$setServerVar[module_$get[module2];true]

$reply[$messageID;
{title:${emojis.toggle.on} The \`$get[module2]\` module was enabled.}

{description:
All commands belonging to this module will now be executable in $serverName.
}

{color:${colors.success}}
;no]

$onlyIf[$getServerVar[module_$get[module2]]==false;{execute:moduleAlr}]

$onlyIf[$checkContains[ $get[module2] ; autoPublish ; modLogs ; messageLogs ; economy ; fun ; info ; tools ; moderation ]==true;{execute:queryNotFound}]
$onlyIf[$checkContains[ $get[module2] ; general ; admin ]==false;{execute:moduleFalse}]

$let[module2;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$get[module1];general];economy&profiles;economy];profiles;economy];messagelogs;messageLogs];modlogs;modLogs];autopublish;autoPublish]]
$let[module1;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$toLowercase[$message];-;]; ;];add;];+;];enable;]]

$onlyPerms[manageserver;{execute:userPerms}]

$endelseIf
$elseIf[$checkContains[$stringStartsWith[$toLowercase[$message];-]$stringStartsWith[$toLowercase[$message];disable ]$stringStartsWith[$toLowercase[$message];remove ];true]==true]

$setServerVar[module_$get[module2];false]

$reply[$messageID;
{title:${emojis.toggle.off} The \`$get[module2]\` module was disabled.}

{description:
All commands belonging to this module will no longer execute in $serverName.
}

{color:${colors.error}}
;no]

$onlyIf[$getServerVar[module_$get[module2]]==true;{execute:moduleAlr}]

$onlyIf[$checkContains[ $get[module2] ; autoPublish ; modLogs ; messageLogs ; economy ; fun ; info ; tools ; moderation ]==true;{execute:queryNotFound}]
$onlyIf[$checkContains[ $get[module2] ; general ; admin ]==false;{execute:moduleFalse}]

$let[module2;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$get[module1];general];economy&profiles;economy];profiles;economy];messagelogs;messageLogs];modlogs;modLogs];autopublish;autoPublish]]
$let[module1;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$toLowercase[$message];-;]; ;];remove;];-;];disable;]]

$onlyPerms[manageserver;{execute:userPerms}]

$endelseIf
$else

$loop[1;args]

$endif

$let[title-enUS;CRBT Settings - Modules]
$let[modules-enUS;
$replaceText[$replaceText[$hasPerms[$authorID;manageserver];true;To enable or disable any module, use \`$getServerVar[prefix]module <enable | disable> <module name>\`.];false;Note that you will need the "Manage server" permissions on this server to disable or enable any of these.]
$replaceText[$replaceText[$getServerVar[module_autoPublish];true;${emojis.toggle.on}];false;${emojis.toggle.off}] Auto-publish
$replaceText[$replaceText[$getServerVar[module_economy];true;${emojis.toggle.on}];false;${emojis.toggle.off}] Economy & profiles
$replaceText[$replaceText[$getServerVar[module_fun];true;${emojis.toggle.on}];false;${emojis.toggle.off}] Fun
$replaceText[$replaceText[$getServerVar[module_info];true;${emojis.toggle.on}];false;${emojis.toggle.off}] Info
$replaceText[$replaceText[$getServerVar[module_messageLogs];true;${emojis.toggle.on}];false;${emojis.toggle.off}] Message logs
$replaceText[$replaceText[$getServerVar[module_modLogs];true;${emojis.toggle.on}];false;${emojis.toggle.off}] Moderation logs
$replaceText[$replaceText[$getServerVar[module_moderation];true;${emojis.toggle.on}];false;${emojis.toggle.off}] Moderation
$replaceText[$replaceText[$getServerVar[module_tools];true;${emojis.toggle.on}];false;${emojis.toggle.off}] Tools
]
$let[essentials-enUS;Essential modules:
You can't disable any of these modules.
${emojis.toggle.fon} General
${emojis.toggle.fon} Settings
]

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}