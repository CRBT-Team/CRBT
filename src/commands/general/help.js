const { emojis, logos } = require("../../../index");

module.exports.command = {
    name: "help",
    description_enUS: "Returns a list of all avaiable modules or information on a specified module or command",
    usage_enUS: "<command name | module name (optional)>",
    examples_enUS: [
        "help",
        "cmds economy",
        "command help"
    ],
    module: "general",
    aliases: ["aled", "ouho", "commands", "cmds", "command", "cmd"],
    slashCmd: 'help commands',
    code: `
$if[$message==]

$reply[$messageID;
{author:$username[$clientID] - Help:$userAvatar[$clientID;64]}

{description:
If you need information on a command, use \`$get[p]help <command name>\`.
To expand a module and see its features and commands, use \`$get[p]help <module name>\`
}

$get[modules]

{color:$getGlobalUserVar[color]}
;no]

$elseIf[$checkContains[ $toLowercase[$message] ; economy & profiles ; profiles ; mod ; general ; economy ; fun ; info ; moderation ; tools ; settings ; administration ; logs ]==true]

$reply[$messageID;
{author:$username[$clientID] - Help:$userAvatar[$clientID;64]}
{description:
If you need information on a command, use \`$get[p]help <command name>\`.
For more general information, use \`$get[p]help\`.
}

$get[$replaceText[$replaceText[$checkContains[$get[module];general;settings];true;essential];false;$replaceText[$replaceText[$checkContains[$get[module];logs];true;mlogs];false;generic]]]

{color:$getGlobalUserVar[color]}
;no]

$let[generic;
{field:$getObjectProperty[moduleNames.$get[module]]:
$replaceText[$replaceText[$getServerVar[module_$replaceText[$get[module];logs;messageLogs]];true;${emojis.toggle.on} This module is enabled on this server.];false;${emojis.toggle.off} This module is disabled on this server.]
$replaceText[$replaceText[$getObjectProperty[modules.$get[module]];<botname>;$username[$clientID]];<prefix>;$get[p]]
:yes}]

$let[essential;
{field:$getObjectProperty[moduleNames.$get[module]]:
${emojis.toggle.fon} This module can't be disabled.
$replaceText[$replaceText[$getObjectProperty[modules.$get[module]];<botname>;$username[$clientID]];<prefix>;$get[p]]
:yes}]

$let[mlogs;
{field:Message logs:
$replaceText[$replaceText[$getServerVar[module_messageLogs];true;${emojis.toggle.on} This module is enabled on this server.];false;${emojis.toggle.off} This module is disabled on this server.]

Allows you to read the previously deleted or edited messages within the server, granted that you have the permissions to view the logs channel.
$replaceText[$replaceText[$getServerVar[module_messageLogs];true;
The logs are currently sent to <#$getServerVar[messagelogs_channel]>.
];false;]
Use \`$get[p]messagelogs <channel>\` to change where message logs should go.
:no}
{field:Moderation logs:
$replaceText[$replaceText[$getServerVar[module_modLogs];true;${emojis.toggle.on} This module is enabled on this server.];false;${emojis.toggle.off} This module is disabled on this server.]

Sends a detailed message upon using a CRBT moderation command (if they are enabled).
$replaceText[$replaceText[$getServerVar[module_modLogs];true;
The logs are currently sent to <#$getServerVar[modlogs_channel]>.
];false;]
Use \`$get[p]modlogs <channel>\` to change where moderation logs should go.
:no}]

$djsEval[d.object.moduleNames = require("../../../../../data/misc/helpText").moduleNames
d.object.modules = require("../../../../../data/misc/helpText").modules]

$let[module;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$toLowercase[$message]; ;];-;];economy&profiles;economy];profiles;economy];mod;moderation];moderationeration;moderation];settings&administration;settings]]

$endelseIf
$elseIf[$checkContains[ $toLowercase[$message] ; music ]==true]

$loop[1;musicDisabled]

$endelseIf
$elseIf[$checkContains[ $toLowercase[$message] ; nsfw ]==true]

$loop[1;nsfwDisabled]

$endelseIf
$else

$reply[$messageID;
{author:$commandInfo[$message;name] - Command info:${logos.CRBTsmall}}

$if[$commandInfo[$message;description_$getGlobalUserVar[language]]!=]
{field:Description:
$replaceText[$replaceText[$commandInfo[$message;description_$getGlobalUserVar[language]];<botname>;$username[$clientID]];<prefix>;$get[p]]
:no}
$else
{field:Description:
No description available, please \`$get[p]report\` this as an issue.
:no}
$endif

{field:Usage:
\`\`\`
$replaceText[$replaceText[$get[p]$commandInfo[$message;name];$get[p]m/;m/];$get[p]=;=] $replaceText[$commandInfo[$message;usage_$getGlobalUserVar[language]];<botname>;$username[$clientID]]\`\`\`
:no}

$if[$commandInfo[$message;examples_$getGlobalUserVar[language]]!=]
{field:Examples:
\`\`\`
$get[p]$replaceText[$commandInfo[$message;examples_$getGlobalUserVar[language]];,;\n$get[p]]
\`\`\`
:no}
$endif

$if[$commandInfo[$message;aliases]!=]
{field:Aliases:
\`\`\`
$replaceText[$commandInfo[$message;aliases];,;, ]\`\`\`
:no}
$endif

$get[$replaceText[$replaceText[$checkContains[/$get[botPerms]/$get[userPerms]/;/true/true/];true;];false;perms]]

$let[perms;
{field:Permission errors:
$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[
$get[botPerms]/$get[userPerms]
;false/true;${emojis.error} **$username[$clientID]** may need the $toLowercase[$replaceText[$commandInfo[$message;botPerms];,;, ]] permissions]
;true/false;${emojis.error} You may need the $toLowercase[$replaceText[$commandInfo[$message;userPerms];,;, ]] permissions]
;false/false;${emojis.error} You may need the $toLowercase[$replaceText[$commandInfo[$message;userPerms];,;, ]] permissions, and **$username[$clientID]** may need the $toLowercase[$replaceText[$commandInfo[$message;botPerms];,;, ]] permissions]
;false/;${emojis.error} **$username[$clientID]** may need the $toLowercase[$replaceText[$commandInfo[$message;botPerms];,;, ]] permissions]
;false/;${emojis.error} You may need the $toLowercase[$replaceText[$commandInfo[$message;userPerms];,;, ]] permissions]
:no}]

$if[$commandInfo[$message;cooldown]!=]
{field:Cooldown:
$getObjectProperty[cd]
:$replaceText[$replaceText[$hasPerms[$authorID;admin];true;no];false;yes]}
$djsEval[
    const tools = require("dbd.js-utils");
    d.object.ms = tools.parseToMS("$commandInfo[$message;cooldown]")
    d.object.cd = tools.parseMS(d.object.ms)
]
$endif

$if[$checkContains[$commandInfo[$message;module];general;admin;settings]==true]

{field:Module:
${emojis.toggle.fon} $toLocaleUppercase[$commandInfo[$message;module]]
$replaceText[$replaceText[$hasPerms[$authorID;admin];true;\`You can't disable this module.\`];false;]
:yes}

$else

{field:Module:
$replaceText[$replaceText[$get[con];true;${emojis.toggle.on}];false;${emojis.toggle.off}] $replaceText[$toLocaleUppercase[$commandInfo[$message;module]];Nsfw;NSFW (18+)]
$replaceText[$replaceText[$hasPerms[$authorID;admin];false;];true;Use \`$get[p]module $replaceText[$replaceText[$get[con];true;disable $get[module]\` to disable];false;enable $get[module]\` to enable] this module.]
:yes}

$let[module;$commandInfo[$message;module]]
$let[con;$getServerVar[module_$commandInfo[$message;module]]]

$endif

{color:$getGlobalUserVar[color]}
;no]

    $if[$commandInfo[$message;userPerms]!=]
        $let[userPerms;$hasPerms[$authorID;$joinSplitText[;]]]
        $textSplit[$replaceText[$commandInfo[$message;userPerms];,;@@];@@]
    $else
        $let[userPerms;true]
    $endif

    $if[$commandInfo[$message;botPerms]!=]
        $let[botPerms;$hasPerms[$clientID;$joinSplitText[;]]]
        $textSplit[$replaceText[$commandInfo[$message;botPerms];,;@@];@@]
    $else
        $let[botPerms;true]
    $endif

$onlyIf[$commandInfo[$message;module]!=music;{execute:musicDisabled}]
$onlyIf[$commandInfo[$message;module]!=nsfw;{execute:nsfwDisabled}]
$onlyIf[$commandInfo[$message;module]!=admin;{execute:cmdDoesntExist}]
$onlyIf[$commandInfo[$message;module]!=;{execute:cmdDoesntExist}]

$endif


$let[modules;
{field:$get[economy] Economy:
Work and get your hourly Purplets to master the wonderous world of $username[$clientID]'s economy system.
:yes}

{field:$get[fun] Fun:
Play around with $username[$clientID]'s ""fun"" commands, including webhook support & animal facts!
:yes}

{field:$get[info] Info:
Get any kind of info with $username[$clientID]'s commands, including user pfps, anime, emojis, Minecraft skins, etc!
:yes}

{field:$get[moderation] Moderation:
Moderate your server using $username[$clientID]'s mute, warn, kick & ban system.
:yes}

{field:$get[logs] Logs:
Use $username[$clientID]'s logging capabilities to track deleted and edited messages, as well as CRBT moderation actions.
:yes}

{field:$get[tools] Tools:
Get things done quickly with a calculator, customizable reminders, currency conversion, and much much more!
:yes}

{field:$get[forced] General:
$username[$clientID]'s base commands, including help, ping, report among others.
:yes}

{field:$get[forced] Settings:
Customize the way you use $username[$clientID] thanks to its varied server & user settings.
:yes}
]

$let[economy;$replaceText[$replaceText[$getServerVar[module_economy];true;$get[on]];false;$get[off]]]
$let[fun;$replaceText[$replaceText[$getServerVar[module_fun];true;$get[on]];false;$get[off]]]
$let[info;$replaceText[$replaceText[$getServerVar[module_info];true;$get[on]];false;$get[off]]]
$let[moderation;$replaceText[$replaceText[$getServerVar[module_moderation];true;$get[on]];false;$get[off]]]
$let[logs;$replaceText[$replaceText[$replaceText[$replaceText[$getServerVar[module_messageLogs]$getServerVar[module_modLogs];truetrue;$get[on]];falsefalse;$get[off]];truefalse;$get[off]];falsetrue;$get[off]]]
$let[tools;$replaceText[$replaceText[$getServerVar[module_tools];true;$get[on]];false;$get[off]]]

$let[forced;$replaceText[${emojis.toggle.fon};:;#COLON#]]
$let[on;$replaceText[${emojis.toggle.on};:;#COLON#]]
$let[off;$replaceText[${emojis.toggle.off};:;#COLON#]]

$let[p;$getServerVar[prefix]]

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
    `}

/*

{field:$get[modules-$getGlobalUserVar[language]]}


partner crap

$if[$commandInfo[$message;module]==partnerCmd]
{field:Module:
${emojis.partner} Partner command
:yes}
{field:Accessible on:
$if[$serverExists[$commandInfo[$message;server]]==true]
$serverName[$commandInfo[$message;server]]
$else
Can't access server
$endif
:yes}
$else
{field:Module:
$replaceText[$replaceText[$checkContains[$commandInfo[$message;module];general;admin;settings];false;$replaceText[$replaceText[$getServerVar[module_$commandInfo[$message;module]];true;${emojis.toggle.on}];false;${emojis.toggleoff}] $toLocaleUppercase[$commandInfo[$message;module]]
$replaceText[$replaceText[$hasPerms[$authorID;admin];true;Use \`$getServerVar[prefix]module $replaceText[$replaceText[$getServerVar[module_$commandInfo[$message;module]];true;disable];false;enable] $commandInfo[$message;module]\` to $replaceText[$replaceText[$getServerVar[module_$commandInfo[$message;module]];true;disable];false;enable] this module.];false;]];true;${emojis.forcedon} $toLocaleUppercase[$commandInfo[$message;module]]
$replaceText[$replaceText[$hasPerms[$authorID;admin];true;\`You can't disable this module.\`];false;]]
:yes}
$endif
*/