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

{description:$get[desc-$getGlobalUserVar[language]]}

$get[modules]

{field:$get[suggested]}

{color:$getGlobalUserVar[color]}
;no]


$elseIf[$checkContains[ $toLowercase[$message] ; economy & profiles ; profiles ; mod ; basic ; economy ; fun ; info ; moderation ; music ; tools ; settings ; nsfw ; administration ]==true]

$reply[$messageID;
{author:$username[$clientID] - Help:$userAvatar[$clientID;64]}
{description:$get[desc-$getGlobalUserVar[language]]}

{field:$get[$get[module]-$getGlobalUserVar[language]]:yes}

{color:$getGlobalUserVar[color]}
;no]

$let[module;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$toLowercase[$message]; ;];-;];economy&profiles;economy];profiles;economy];mod;moderation];moderationeration;moderation];settings&administration;settings-$hasPerms[$authorID;admin]];settings;settings-$hasPerms[$authorID;admin]];administration;settings-$hasPerms[$authorID;admin]];settings-$hasPerms[$authorID;admin]-$hasPerms[$authorID;admin];settings-$hasPerms[$authorID;admin]]]

$endelseIf
$else

$reply[$messageID;
{author:$commandInfo[$message;name] - Command info:${logos.CRBTsmall}}

$if[$commandInfo[$message;description_$getGlobalUserVar[language]]!=]
{field:Description:
$replaceText[$replaceText[$commandInfo[$message;description_$getGlobalUserVar[language]];<botname>;$username[$clientID]];<prefix>;$getServerVar[prefix]]
:no}
$else
{field:Description:
No description available, please \`$getServerVar[prefix]report\` this as an issue.
:no}
$endif

{field:Usage:
\`\`\`
$replaceText[$replaceText[$getServerVar[prefix]$commandInfo[$message;name];$getServerVar[prefix]m/;m/];$getServerVar[prefix]=;=] $replaceText[$commandInfo[$message;usage_$getGlobalUserVar[language]];<botname>;$username[$clientID]]\`\`\`
:no}

$if[$commandInfo[$message;examples_enUS]!=]
{field:Examples:
\`\`\`
$getServerVar[prefix]$replaceText[$commandInfo[$message;examples_$getGlobalUserVar[language]];,;\n$getServerVar[prefix]]
\`\`\`
:no}
$endif

$if[$commandInfo[$message;aliases]!=]
{field:Aliases:
\`\`\`
$replaceText[$commandInfo[$message;aliases];,;, ]\`\`\`
:no}
$endif

$get[$replaceText[$replaceText[$checkContains[$get[botPerms]/$get[userPerms];true];true;];false;perms]]

$let[perms;
{field:Permission errors:
$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[
$get[botPerms]/$get[userPerms]
;true/true;${emojis.success} You're all set to use this command!]
;false/true;${emojis.error} **$username[$clientID]** may need the $toLowercase[$replaceText[$commandInfo[$message;botPerms];,;, ]] permissions]
;true/false;${emojis.error} You may need the $toLowercase[$replaceText[$commandInfo[$message;userPerms];,;, ]] permissions]
;false/false;${emojis.error} You may need the $toLowercase[$replaceText[$commandInfo[$message;userPerms];,;, ]] permissions, and **$username[$clientID]** may need the $toLowercase[$replaceText[$commandInfo[$message;botPerms];,;, ]] permissions]
;/true;${emojis.success} You're all set to use this command!]
;true/;${emojis.success} You're all set to use this command!]
;false/;${emojis.error} **$username[$clientID]** may need the $toLowercase[$replaceText[$commandInfo[$message;botPerms];,;, ]] permissions]
;false/;${emojis.error} You may need the $toLowercase[$replaceText[$commandInfo[$message;userPerms];,;, ]] permissions]
:no}]

$if[$commandInfo[$message;cooldown]!=]
{field:Cooldown:
$replaceText[$replaceText[$checkCondition[$commandInfo[$message;cooldown]==];true;None];false;$commandInfo[$message;cooldown]]
:$replaceText[$replaceText[$hasPerms[$authorID;admin];true;no];false;yes]
}
$endif

{field:Module:
$replaceText[$replaceText[$checkContains[$commandInfo[$message;module];basic;admin;settings];false;$replaceText[$replaceText[$getServerVar[module_$commandInfo[$message;module]];true;${emojis.toggleon}];false;${emojis.toggleoff}] $toLocaleUppercase[$commandInfo[$message;module]]
$replaceText[$replaceText[$hasPerms[$authorID;admin];true;Use \`$getServerVar[prefix]module $replaceText[$replaceText[$getServerVar[module_$commandInfo[$message;module]];true;disable];false;enable] $commandInfo[$message;module]\` to $replaceText[$replaceText[$getServerVar[module_$commandInfo[$message;module]];true;disable];false;enable] this module.];false;]];true;${emojis.forcedon} $toLocaleUppercase[$commandInfo[$message;module]]
$replaceText[$replaceText[$hasPerms[$authorID;admin];true;\`You can't disable this module.\`];false;]]
:yes}

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

$if[$checkContains[$checkCondition[$getUserVar[helpSuggestions]==]$checkContains[$getUserVar[helpSuggestions];basic-general-];true]==true]
$let[suggested;Suggested commands:
Note: Suggestions will only get better as you use CRBT more often!
\`\`\`
• $getServerVar[prefix]report $commandinfo[report;usage_enUS]
• $getServerVar[prefix]info
• $getServerVar[prefix]invite
• $getServerVar[prefix]play $commandinfo[play;usage_enUS]
• $getServerVar[prefix]balance
\`\`\`
]
$setUserVar[helpSuggestions;basic-general-$hasPerms[$authorID;manageserver]]
$else
$let[suggested;Suggested commands:
Note: Suggestions will only get better as you use CRBT more often!
\`\`\`
$splitText[1]
$splitText[2]
$splitText[3]
\`\`\`
]
$textSplit[$getUserVar[helpSuggestions];-]
$endif

$let[basic-enUS;Basic commands:
${emojis.forcedon} This module can't be disabled.

• \`@$username[$clientID]\`
Get a mini-help menu (useful if you've forgotten $username[$clientID]'s prefix).
• \`$getServerVar[prefix]help\`
Get CRBT's help on its general usage, or on any command. 
• \`$getServerVar[prefix]report $commandinfo[report;usage_enUS]\`
Report any bug you find on CRBT to its developers!
• \`$getServerVar[prefix]suggest $commandinfo[suggest;usage_enUS]\`
Suggest anything to add to CRBT!
• \`$getServerVar[prefix]info\`
Get CRBT's ping, stats and some other nerdy info.
• \`$getServerVar[prefix]ping\`
$replaceText[$commandInfo[ping;description_enUS];<botname>;$username[$clientID]]
• \`$getServerVar[prefix]invite\`
To invite CRBT on your server, or join the support server!]


$let[economy-enUS;Economy & profiles:
$replaceText[$replaceText[$getServerVar[module_economy];true;${emojis.toggleon} This module is enabled on this server.];false;${emojis.toggleoff} This module is disabled on this server.]

• \`$getServerVar[prefix]jobsearch\`
Gives you 3 random job propositions to get you started!
• \`$getServerVar[prefix]hourly\`
Claim a few Purplets every hour to get higher rewards!
• \`$getServerVar[prefix]store\`
Open the Store, where you can buy all sorts of profile items.
• \`$getServerVar[prefix]inventory\`
Opens your item inventory on CRBT, and gives you useful tips!
• \`$getServerVar[prefix]profile\`
Displays your CRBT profile.]


$let[moderation-enUS;Moderation:
$replaceText[$replaceText[$getServerVar[module_moderation];true;${emojis.toggleon} This module is enabled on this server.];false;${emojis.toggleoff} This module is disabled on this server.]

• \`$getServerVar[prefix]kick\`, \`$getServerVar[prefix]ban\`, \`$getServerVar[prefix]warn\`, \`$getServerVar[prefix]mute\`
Kicks, bans, gives a muted role or a warning to a specified user (via its user ID or a @mention)
• \`$getServerVar[prefix]purge\`
Bulk deletes a specified number of messages in the current channel.
• \`$getServerVar[prefix]snipe\`
Finds the latest deleted message on the current channel, or on a specified channel (if any).
• \`$getServerVar[prefix]strikes $commandinfo[strikes;usage_enUS]\`
$commandinfo[strikes;description_enUS]]


$let[fun-enUS;Fun commands:
$replaceText[$replaceText[$getServerVar[module_fun];true;${emojis.toggleon} This module is enabled on this server.];false;${emojis.toggleoff} This module is disabled on this server.]

• \`$getServerVar[prefix]8ball\`
Asks your question to 8-Ball, and retrieves its honest answer. 
• \`$getServerVar[prefix]bird\`, \`cat\`, \`dog\`, \`fox\`, \`koala\` or \`panda\`
Gives a random animal picture and a fact!
• \`$getServerVar[prefix]reverse\`
.)nevig smrep fi( koohbew a sa ti sdnes dna txet ruoy sesreveR
• \`$getServerVar[prefix]shout\`
**SHOUTS YOUR MESSAGE OUR LOUD AND SENDS IT IN A WEBHOOK (IF PERMS GIVEN)!!!**
• \`$getServerVar[prefix]textshuffle\`
Shuffles your message's words into a completely random mess of a sentence!]


$let[tools-enUS;Tools:
$replaceText[$replaceText[$getServerVar[module_tools];true;${emojis.toggleon} This module is enabled on this server.];false;${emojis.toggleoff} This module is disabled on this server.]

• \`$getServerVar[prefix]coinflip\`
Flips a ${emojis.purplet} Purplet and gives you the result.
• \`$getServerVar[prefix]convert\`
Converts a specified currency into another one.
• \`$getServerVar[prefix]calculate\`
Calculates and resolves a given math problem.
• \`$getServerVar[prefix]ocr\`
Fetches text from a given image.
• \`$getServerVar[prefix]pick\`
Picks one choice among multiple options.
• \`$getServerVar[prefix]remindme\`
Reminds you of a specified subject in the given time.
• \`$getServerVar[prefix]rng\`
Gives you a random number from the minimum to the maximum.
• \`$getServerVar[prefix]translate\`
Translates given text into the target language.]


$let[info-enUS;Info commands:
$replaceText[$replaceText[$getServerVar[module_info];true;${emojis.toggleon} This module is enabled on this server.];false;${emojis.toggleoff} This module is disabled on this server.]

• \`$getServerVar[prefix]anime <anime name>\`
• \`$getServerVar[prefix]avatar <user (optional)>\`
• \`$getServerVar[prefix]channelinfo <channel>\`
• \`$getServerVar[prefix]define <english word>\`
• \`$getServerVar[prefix]emojiinfo <emoji>\`
• \`$getServerVar[prefix]github <GitHub username> <repository>\`
• \`$getServerVar[prefix]icon <server ID (optional)>\`
• \`$getServerVar[prefix]inviteinfo <invite link>\`
• \`$getServerVar[prefix]manga <manga name>\`
• \`$getServerVar[prefix]skin <Minecraft player name>\`
• \`$getServerVar[prefix]mcserver <Minecraft server address>\`
• \`$getServerVar[prefix]npm <npm package name>\`
• \`$getServerVar[prefix]roleinfo <role>\`
• \`$getServerVar[prefix]serverinfo <server ID (optional)>\`
• \`$getServerVar[prefix]userinfo <user (optional)>\`
• \`$getServerVar[prefix]urbandictionary <word or expression>\`
• \`$getServerVar[prefix]weather <city>\`]


$let[settings-true-enUS;Settings:
${emojis.forcedon} This module can't be disabled.

• \`$getServerVar[prefix]color\`
Change $username[$clientID]'s accent color across all commands.
• \`$getServerVar[prefix]prefix\`
Change $username[$clientID]'s prefix (currently \`$getServerVar[prefix]\`) on the server!
-
• \`$getServerVar[prefix]addemoji $commandinfo[addemoji;usage_enUS]\`
Adds a specified emoji to the current server.
-
• \`$getServerVar[prefix]dashboard\`
Get a list of $username[$clientID]'s entire settings for the server or yourself.
• \`$getServerVar[prefix]modules\`
Gives you a list of all modules to enable or disable on the current server.]


$let[settings-false-enUS;Settings:
${emojis.forcedon} This module can't be disabled.

• \`$getServerVar[prefix]color\`
Change $username[$clientID]'s accent color across all commands.
• \`$getServerVar[prefix]telemetry\`
Get to know how your data is used on CRBT, and change your privacy settings.]


$let[music-enUS;Music commands:
$replaceText[$replaceText[$getServerVar[module_music];true;${emojis.toggleon} This module is enabled on this server.];false;${emojis.toggleoff} This module is disabled on this server.]

• \`$getServerVar[prefix]play\`
Queues or directly plays the song of your choice.
• \`$getServerVar[prefix]nowplaying\`
$commandInfo[nowplaying;description_enUS]
• \`$getServerVar[prefix]queue\`
$commandInfo[nowplaying;description_enUS]
• \`$getServerVar[prefix]stop\`
Disconnects $username[$clientID] from its voice channels and clears the queue.
• \`$getServerVar[prefix]volume\`
Gives you volume controls or manually sets the volume.]


$let[nsfw-enUS;Not Safe For Work commands:
$replaceText[$replaceText[$getServerVar[module_nsfw];true;${emojis.toggleon} This module is enabled on this server.];false;${emojis.toggleoff} This module is disabled on this server.]

Warning: Contains unsuitable language for minor audiences.
||• \`$getServerVar[prefix]blowjob\`
• \`$getServerVar[prefix]breasts\`
• \`$getServerVar[prefix]feet\`
• \`$getServerVar[prefix]hentai\`
• \`$getServerVar[prefix]lesbian\`
• \`$getServerVar[prefix]irl\`
• \`$getServerVar[prefix]rule34 $commandinfo[r34;usage_enUS]\`
$commandinfo[r34;description_enUS]
• \`$getServerVar[prefix]sperm\`
• \`$getServerVar[prefix]vagina\`||]

$let[desc-enUS;If you need information on a command, use \`$getServerVar[prefix]help <command name>\`.
Keep your eyes peeled for the full command list website, coming soon.]

$let[modules;
{field:$get[economy] Economy:
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
:yes}

{field:$get[fun] Fun:
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
:yes}

{field:$get[info] Info:
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
:yes}

{field:$get[moderation] Moderation:
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
:yes}

{field:$get[music] Music:
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
:yes}

{field:$get[tools] Tools:
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
:yes}

{field:$get[forced] Basic:
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
:yes}

{field:$get[forced] Settings:
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
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