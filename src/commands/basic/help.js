const { emojis, logos } = require("../../../index");
const e = emojis.other

module.exports.command = {
    name: "help",
    description_enUS: "Returns a list of all avaiable modules or information on a specified module or command",
    usage_enUS: "<command name | module name (optional)>",
    examples_enUS: [
        "help",
        "cmds music",
        "command help"
    ],
    module: "basic",
    aliases: ["aled", "ouho", "commands", "cmds", "command", "cmd"],
    code: `
$if[$message==]

$reply[$messageID;
{author:$username[$clientID] - Help:$userAvatar[$clientID;64]}

{description:
If you need information on a command, use \`$get[p]help <command name>\`.
Keep your eyes peeled for the full command list website, coming soon.
**Note:** Not all commands and modules are listed here yet.
}

$get[modules]

{field:$get[suggested]}

{color:$getGlobalUserVar[color]}
;no]

$elseIf[$checkContains[ $toLowercase[$message] ; economy & profiles ; profiles ; mod ; basic ; economy ; fun ; info ; moderation ; music ; tools ; settings ; nsfw ; administration ]==true]

$setGlobalUserVar[helpSuggestions;$splitText[1]-$get[module]]

$textSplit[$getGlobalUserVar[helpSuggestions];-]

$reply[$messageID;
{author:$username[$clientID] - Help:$userAvatar[$clientID;64]}
{description:
If you need information on a command, use \`$get[p]help <command name>\`.
Keep your eyes peeled for the full command list website, coming soon.
**Note:** Not all commands and modules are listed here yet.
}

{field:$getObjectProperty[data.moduleNames.$get[module]]:
$replaceText[$replaceText[$getServerVar[module_$get[module]];true;${emojis.toggleon} This module is enabled on this server.];false;${emojis.toggleoff} This module is disabled on this server.]
$replaceText[$replaceText[$getObjectProperty[data.modules.$get[module]];<botname>;$username[$clientID]];<prefix>;$get[p]]
:yes}

{color:$getGlobalUserVar[color]}
;no]

$let[module;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$toLowercase[$message]; ;];-;];economy&profiles;economy];profiles;economy];mod;moderation];moderationeration;moderation];settings&administration;settings]]

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

$if[$checkContains[$commandInfo[$message;module];basic;admin;settings]==true]

{field:Module:
${emojis.forcedon} $toLocaleUppercase[$commandInfo[$message;module]]
$replaceText[$replaceText[$hasPerms[$authorID;admin];true;\`You can't disable this module.\`];false;]
:yes}

$else

{field:Module:
$replaceText[$replaceText[$get[con];true;${emojis.toggleon}];false;${emojis.toggleoff}] $replaceText[$toLocaleUppercase[$commandInfo[$message;module]];Nsfw;NSFW (18+)]
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

$onlyIf[$commandInfo[$message;module]!=;{execute:cmdDoesntExist}]

$endif

$if[$checkContains[$checkCondition[$getGlobalUserVar[helpSuggestions]==]$checkContains[$getGlobalUserVar[helpSuggestions];basic-general];true]==true]
$let[suggested;Suggested commands:
Note: Suggestions will only get better as you use $username[$clientID] more often!
\`\`\`
• $get[p]bugreport $commandinfo[report;usage_enUS]
• $get[p]info
• $get[p]invite
• $get[p]play $commandinfo[play;usage_enUS]
• $get[p]balance
\`\`\`
]
$setGlobalUserVar[helpSuggestions;basic-general]
$else
$let[suggested;Suggested commands:
**Note:** Suggestions will only get better as you use $username[$clientID] more often!
\`\`\`
• $replaceText[$replaceText[$replaceText[$getObjectProperty[$get[sugg1]];<prefix>;$get[p]];,$get[p];\n• $get[p]];<botname>;$username[$clientID]]
• $replaceText[$replaceText[$replaceText[$getObjectProperty[$get[sugg2]];<prefix>;$get[p]];,$get[p];\n• $get[p]];<botname>;$username[$clientID]]
\`\`\`
]
$let[sugg1;data.suggested.$replaceText[$replaceText[$splitText[1];nsfw;basic];settings;settings_$hasPerms[$authorID;manageserver]]1]
$let[sugg2;data.suggested.$replaceText[$replaceText[$splitText[2];nsfw;basic];settings;settings_$hasPerms[$authorID;manageserver]]2]
$textSplit[$getGlobalUserVar[helpSuggestions];-]
$endif

$djsEval[const data = require("../../../../../data/misc/help-text.js")
d.object.data = data
]


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

{field:$get[music] Music:
Use $username[$clientID] as a shared music player inside your voice channel.
:yes}

{field:$get[tools] Tools:
Get things done quickly with a calculator, customizable reminders, currency conversion, and much much more!
:yes}

{field:$get[forced] Basic:
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
$let[music;$replaceText[$replaceText[$getServerVar[module_music];true;$get[on]];false;$get[off]]]
$let[tools;$replaceText[$replaceText[$getServerVar[module_tools];true;$get[on]];false;$get[off]]]

$let[forced;$replaceText[${emojis.forcedon};:;#COLON#]]
$let[on;$replaceText[${emojis.toggleon};:;#COLON#]]
$let[off;$replaceText[${emojis.toggleoff};:;#COLON#]]

$let[p;$getServerVar[prefix]]

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
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
$replaceText[$replaceText[$checkContains[$commandInfo[$message;module];basic;admin;settings];false;$replaceText[$replaceText[$getServerVar[module_$commandInfo[$message;module]];true;${emojis.toggleon}];false;${emojis.toggleoff}] $toLocaleUppercase[$commandInfo[$message;module]]
$replaceText[$replaceText[$hasPerms[$authorID;admin];true;Use \`$getServerVar[prefix]module $replaceText[$replaceText[$getServerVar[module_$commandInfo[$message;module]];true;disable];false;enable] $commandInfo[$message;module]\` to $replaceText[$replaceText[$getServerVar[module_$commandInfo[$message;module]];true;disable];false;enable] this module.];false;]];true;${emojis.forcedon} $toLocaleUppercase[$commandInfo[$message;module]]
$replaceText[$replaceText[$hasPerms[$authorID;admin];true;\`You can't disable this module.\`];false;]]
:yes}
$endif
*/