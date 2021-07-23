const {illustrations,colors,emojis} = require("../../../index");

module.exports.command = {
    name: "module",
    description_enUS: "Lists all available modules, or disables/enables any if specified",
    usage_enUS: "<enable | + | - | disable (optional)> <module name (optional)>",
    examples_enUS: [
        "modules",
        "module enable message logs",
        "cfg remove Music",
        "md +autopublish"
    ],
    module: "settings",
    aliases: ["modules", "config", "cfg", "md"],
    userPerms: "manageserver",
    code: `
$if[$message==]

$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]:${illustrations.settings}}

{field:$get[modules-$getGlobalUserVar[language]]}

{field:$get[essentials-$getGlobalUserVar[language]]}

{color:$getGlobalUserVar[color]}
;no]


$elseIf[$checkContains[$stringStartsWith[$toLowercase[$message];+]$stringStartsWith[$toLowercase[$message];enable ]$stringStartsWith[$toLowercase[$message];add ];true]==true]

$setServerVar[module_$get[module2];true]

$reply[$messageID;
{title:${emojis.toggleon} The \`$get[module2]\` module was enabled.}

{description:
All commands belonging to this module will now be executable in $serverName.
}

{color:${colors.success}}
;no]

$onlyIf[$getServerVar[module_$get[module2]]==false;{execute:moduleAlr}]

$onlyIf[$checkContains[ $get[module2] ; music ; autoreact ; autoPublish ; modLogs ; messageLogs ; nsfw ; economy ; fun ; info ; tools ]==true;{execute:queryNotFound}]
$onlyIf[$checkContains[ $get[module2] ; basic ; misc ; admin ; partnercmd]==false;{execute:moduleFalse}]

$let[module2;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$get[module1];basic;misc];economy&profiles;economy];profiles;economy];messagelogs;messageLogs];modlogs;modLogs];autopublish;autoPublish]]
$let[module1;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$toLowercase[$message];-;]; ;];add;];+;];enable;]]

$onlyPerms[manageserver;{execute:userPerms}]

$endelseIf
$elseIf[$checkContains[$stringStartsWith[$toLowercase[$message];-]$stringStartsWith[$toLowercase[$message];disable ]$stringStartsWith[$toLowercase[$message];remove ];true]==true]

$setServerVar[module_$get[module2];false]

$reply[$messageID;
{title:${emojis.toggleoff} The \`$get[module2]\` module was disabled.}

{description:
All commands belonging to this module will no longer execute in $serverName.
}

{color:${colors.error}}
;no]

$onlyIf[$getServerVar[module_$get[module2]]==true;{execute:moduleAlr}]

$onlyIf[$checkContains[ $get[module2] ; music ; autoreact ; autoPublish ; modLogs ; messageLogs ; nsfw ; economy ; fun ; info ; tools ]==true;{execute:queryNotFound}]
$onlyIf[$checkContains[ $get[module2] ; basic ; misc ; admin ; partnercmd]==false;{execute:moduleFalse}]

$let[module2;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$get[module1];basic;misc];economy&profiles;economy];profiles;economy];messagelogs;messageLogs];modlogs;modLogs];autopublish;autoPublish]]
$let[module1;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$toLowercase[$message];-;]; ;];remove;];-;];disable;]]

$onlyPerms[manageserver;{execute:userPerms}]

$endelseIf
$else

$loop[1;args]

$endif

$let[title-enUS;CRBT Settings - Modules]
$let[modules-enUS;Modules:
$replaceText[$replaceText[$hasPerms[$authorID;manageserver];true;To enable or disable any module, use \`$getServerVar[prefix]module <enable | disable> <module name>\`.];false;Note that you will need the "Manage server" permissions on this server to disable or enable any of these.]
$replaceText[$replaceText[$getServerVar[module_autoreact];true;${emojis.toggleon}];false;${emojis.toggleoff}] Auto-react
$replaceText[$replaceText[$getServerVar[module_autoPublish];true;${emojis.toggleon}];false;${emojis.toggleoff}] Auto-publish
$replaceText[$replaceText[$getServerVar[module_economy];true;${emojis.toggleon}];false;${emojis.toggleoff}] Economy & profiles
$replaceText[$replaceText[$getServerVar[module_fun];true;${emojis.toggleon}];false;${emojis.toggleoff}] Fun
$replaceText[$replaceText[$getServerVar[module_info];true;${emojis.toggleon}];false;${emojis.toggleoff}] Info
$replaceText[$replaceText[$getServerVar[module_messageLogs];true;${emojis.toggleon}];false;${emojis.toggleoff}] Message logs
$replaceText[$replaceText[$getServerVar[module_modLogs];true;${emojis.toggleon}];false;${emojis.toggleoff}] Moderation logs
$replaceText[$replaceText[$getServerVar[module_moderation];true;${emojis.toggleon}];false;${emojis.toggleoff}] Moderation
$replaceText[$replaceText[$getServerVar[module_music];true;${emojis.toggleon}];false;${emojis.toggleoff}] Music
$replaceText[$replaceText[$getServerVar[module_nsfw];true;${emojis.toggleon}];false;${emojis.toggleoff}] NSFW
$replaceText[$replaceText[$getServerVar[module_tools];true;${emojis.toggleon}];false;${emojis.toggleoff}] Tools
]
$let[essentials-enUS;Essential modules:
You can't disable any of these modules.
${emojis.forcedon} Basic
${emojis.forcedon} Settings
${emojis.forcedon} Admin
]

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}