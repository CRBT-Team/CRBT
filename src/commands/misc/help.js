const { emojis, logos } = require("../../../index");

module.exports.command = {
    name: "help",
    description_enUS: "eeeeeeeeeeee",
    usage_enUS: "<command name | page number (optional)>",
    examples_enUS: [
        "help",
        "cmds 1",
        "command help"
    ],
    module: "misc",
    aliases: ["aled", "ouho", "commands", "cmds", "command", "cmd"],
    code: `
$if[$checkContains[$checkCondition[$message==]$checkCondition[$message==1];true]==true]

    $if[$channelType!=dm] 
    $reactionCollector[$botLastMessageID;$authorID;15m;1️⃣,2️⃣,3️⃣,4️⃣,5️⃣;hp1,hp2,hp3,hp4,hp5;yes] 
    $endif

$reply[$messageID;
{author:$username[$clientID] - Help (Page 1):$userAvatar[$clientID;64]}
{description:$get[desc-$getGlobalUserVar[language]]}

{field:$get[basic-$getGlobalUserVar[language]]:yes}

{field:$get[tools-$getGlobalUserVar[language]]:yes}

{color:$getGlobalUserVar[color]}
;no]


$elseIf[$message==2]

    $if[$channelType!=dm] 
    $reactionCollector[$botLastMessageID;$authorID;15m;1️⃣,2️⃣,3️⃣,4️⃣,5️⃣;hp1,hp2,hp3,hp4,hp5;yes] 
    $endif

$reply[$messageID;
{author:$username[$clientID] - Help (Page 2):$userAvatar[$clientID;64]}
{description:$get[desc-$getGlobalUserVar[language]]}

{field:$get[info-$getGlobalUserVar[language]]:yes}

{field:$get[economy-$getGlobalUserVar[language]]:yes}

{color:$getGlobalUserVar[color]}
;no]


$endelseIf
$elseIf[$message==3]

    $if[$channelType!=dm] 
    $reactionCollector[$botLastMessageID;$authorID;15m;1️⃣,2️⃣,3️⃣,4️⃣,5️⃣;hp1,hp2,hp3,hp4,hp5;yes] 
    $endif

$reply[$messageID;
{author:$username[$clientID] - Help (Page 3):$userAvatar[$clientID;64]}
{description:$get[desc-$getGlobalUserVar[language]]}

{field:$get[music-$getGlobalUserVar[language]]:yes}

{field:$get[fun-$getGlobalUserVar[language]]:yes}

{color:$getGlobalUserVar[color]}
;no]


$endelseIf
$elseIf[$message==4]

    $if[$channelType!=dm] 
    $reactionCollector[$botLastMessageID;$authorID;15m;1️⃣,2️⃣,3️⃣,4️⃣,5️⃣;hp1,hp2,hp3,hp4,hp5;yes] 
    $endif

$reply[$messageID;
{author:$username[$clientID] - Help (Page 4):$userAvatar[$clientID;64]}
{description:$get[desc-$getGlobalUserVar[language]]}

{field:$get[moderation-$getGlobalUserVar[language]]:yes}

{field:$get[settings-$hasPerms[$authorID;manageserver]-$getGlobalUserVar[language]]:yes}

{color:$getGlobalUserVar[color]}
;no]


$endelseIf
$elseIf[$message==5]

    $if[$channelType!=dm] 
    $reactionCollector[$botLastMessageID;$authorID;15m;1️⃣,2️⃣,3️⃣,4️⃣,5️⃣;hp1,hp2,hp3,hp4,hp5;yes] 
    $endif

$reply[$messageID;
{author:$username[$clientID] - Help (Page 5):$userAvatar[$clientID;64]}
{description:$get[desc-$getGlobalUserVar[language]]}

{field:$get[nsfw-$getGlobalUserVar[language]]:yes}

{color:$getGlobalUserVar[color]}
;no]


$endelseIf
$elseIf[$checkContains[$message;basic;misc;moderation;music;mod;nsfw;settings;tools;info;fun;economy;profiles]==true]

$reply[$messageID;

;no]


$endelseIf
$else

$reply[$messageID;
{author:$commandInfo[$message;name] - Command info:${logos.CRBTsmall}}
{field:Description:
$replaceText[$replaceText[$checkCondition[$commandInfo[$message;description_$getGlobalUserVar[language]]!=];true;$replaceText[$replaceText[$commandInfo[$message;description_$getGlobalUserVar[language]];<botname>;$username[$clientID]];<prefix>;$getServerVar[prefix]]];false;No description available, please \`$getServerVar[prefix]report\` this as an issue.]
:no}
{field:Usage:
\`\`\`
$replaceText[$replaceText[$getServerVar[prefix]$commandInfo[$message;name];$getServerVar[prefix]m/;m/];$getServerVar[prefix]=;=] $replaceText[$commandInfo[$message;usage_$getGlobalUserVar[language]];<botname>;$username[$clientID]]\`\`\`
:no}
{field:Aliases:
\`\`\`
$replaceText[$commandInfo[$message;aliases];,;, ]\`\`\`
:no}
{field:Permission errors:
$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[
$get[botPerms]/$get[userPerms]
;true/true;${emojis.general.success} You're all set to use this command!]
;false/true;${emojis.general.error} **$username[$clientID]** may need the $toLowercase[$replaceText[$commandInfo[$message;botPerms];,;, ]] permissions]
;true/false;${emojis.general.error} You may need the $toLowercase[$replaceText[$commandInfo[$message;userPerms];,;, ]] permissions]
;false/false;${emojis.general.error} You may need the $toLowercase[$replaceText[$commandInfo[$message;userPerms];,;, ]] permissions, and **$username[$clientID]** may need the $toLowercase[$replaceText[$commandInfo[$message;botPerms];,;, ]] permissions]
;/true;${emojis.general.success} You're all set to use this command!]
;true/;${emojis.general.success} You're all set to use this command!]
;false/;${emojis.general.error} **$username[$clientID]** may need the $toLowercase[$replaceText[$commandInfo[$message;botPerms];,;, ]] permissions]
;false/;${emojis.general.error} You may need the $toLowercase[$replaceText[$commandInfo[$message;userPerms];,;, ]] permissions]
:no}
{field:Cooldown:
$replaceText[$replaceText[$checkCondition[$commandInfo[$message;cooldown]==];true;None];false;$commandInfo[$message;cooldown]]
:$replaceText[$replaceText[$hasPerms[$authorID;admin];true;no];false;yes]}

$if[$commandInfo[$message;module]==partnerCmd]
{field:Module:
${emojis.general.partner} Partner command
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
$replaceText[$replaceText[$checkContains[$commandInfo[$message;module];misc;admin;settings];false;$replaceText[$replaceText[$getServerVar[module_$commandInfo[$message;module]];true;${emojis.general.toggleon}];false;${emojis.general.toggleoff}] $toLocaleUppercase[$commandInfo[$message;module]]
$replaceText[$replaceText[$hasPerms[$authorID;admin];true;Use \`$getServerVar[prefix]module $replaceText[$replaceText[$getServerVar[module_$commandInfo[$message;module]];true;disable];false;enable] $commandInfo[$message;module]\` to $replaceText[$replaceText[$getServerVar[module_$commandInfo[$message;module]];true;disable];false;enable] this module.];false;]];true;${emojis.general.forcedon} $toLocaleUppercase[$commandInfo[$message;module]]
$replaceText[$replaceText[$hasPerms[$authorID;admin];true;\`You can't disable this module.\`];false;]]
:yes}
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




$let[economy-enUS;Economy & profiles:
$replaceText[$replaceText[$getServerVar[module_economy];true;${emojis.general.toggleon} This module is enabled on this server.];false;${emojis.general.toggleoff} This module is disabled on this server.]

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


$let[basic-enUS;Basic commands:
${emojis.general.forcedon} You can't disable this module.

• \`$getServerVar[prefix]help\`
Get CRBT's help on its general usage, or on any command. 
• \`$getServerVar[prefix]report\`
Report any bug you find on CRBT to its developers!
• \`$getServerVar[prefix]suggest\`
Suggest anything to add to CRBT!
• \`$getServerVar[prefix]info\`
Get CRBT's connection status and some other useful info.
• \`$getServerVar[prefix]ping\`
$replaceText[$commandInfo[ping;description_enUS];<botname>;$username[$clientID]]
• \`$getServerVar[prefix]invite\`
To invite CRBT on your server, or join the support server!]


$let[moderation-enUS;Moderation:
$replaceText[$replaceText[$getServerVar[module_moderation];true;${emojis.general.toggleon} This module is enabled on this server.];false;${emojis.general.toggleoff} This module is disabled on this server.]

• \`$getServerVar[prefix]kick\`, \`$getServerVar[prefix]ban\`, \`$getServerVar[prefix]warn\`
Kicks, bans or gives a warning to a specified user (via its user ID or a @mention)
• \`$getServerVar[prefix]purge\`
Bulk deletes a specified number of messages in the current channel.
• \`$getServerVar[prefix]snipe\`
Finds the latest deleted message on the current channel, or on a specified channel (if any).]


$let[fun-enUS;Fun commands:
$replaceText[$replaceText[$getServerVar[module_fun];true;${emojis.general.toggleon} This module is enabled on this server.];false;${emojis.general.toggleoff} This module is disabled on this server.]

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
$replaceText[$replaceText[$getServerVar[module_tools];true;${emojis.general.toggleon} This module is enabled on this server.];false;${emojis.general.toggleoff} This module is disabled on this server.]

• \`$getServerVar[prefix]coinflip\`
Flips a ${emojis.general.purplet} Purplet and gives you the result.
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
$replaceText[$replaceText[$getServerVar[module_info];true;${emojis.general.toggleon} This module is enabled on this server.];false;${emojis.general.toggleoff} This module is disabled on this server.]

• \`$getServerVar[prefix]anime <anime name>\`
• \`$getServerVar[prefix]avatar <user (optional)>\`
• \`$getServerVar[prefix]channelinfo <channel>\`
• \`$getServerVar[prefix]define <english word>\`
• \`$getServerVar[prefix]emoji <emoji>\`
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
• \`$getServerVar[prefix]weather <city>\`]


$let[settings-true-enUS;Settings:
${emojis.general.forcedon} You can't disable this module.

• \`$getServerVar[prefix]color\`
Change $username[$clientID]'s accent color across all commands.
• \`$getServerVar[prefix]modules\`
Gets a list of all modules to enable or disable on the current server.
• \`$getServerVar[prefix]prefix\`
Change $username[$clientID]'s prefix (currently \`$getServerVar[prefix]\`) on the server!
• \`$getServerVar[prefix]dashboard\`
Get a list of $username[$clientID]'s entire settings for the server or yourself.]


$let[settings-false-enUS;Settings:
${emojis.general.forcedon} You can't disable this module.

• \`$getServerVar[prefix]color\`
Change $username[$clientID]'s accent color across all commands.
• \`$getServerVar[prefix]telemetry\`
Get to know how your data is used on CRBT, and change your privacy settings.]


$let[music-enUS;Music commands:
$replaceText[$replaceText[$getServerVar[module_music];true;${emojis.general.toggleon} This module is enabled on this server.];false;${emojis.general.toggleoff} This module is disabled on this server.]

• \`$getServerVar[prefix]play\`
Queues or directly plays the song of your choice.
• \`$getServerVar[prefix]nowplaying\`
$commandInfo[nowplaying;description_enUS]
• \`$getServerVar[prefix]queue\`
$commandInfo[nowplaying;description_enUS]
• \`$getServerVar[prefix]stop\`
Disconnects $username[$clientID] from its voice channels and clears the queue.]


$let[nsfw-enUS;Not Safe For Work commands:
$replaceText[$replaceText[$getServerVar[module_nsfw];true;${emojis.general.toggleon} This module is enabled on this server.];false;${emojis.general.toggleoff} This module is disabled on this server.]

Warning: Contains unsuitable language for minor audiences.
||• \`$getServerVar[prefix]play\`
Queues or directly plays the song of your choice.
• \`$getServerVar[prefix]nowplaying\`
$commandInfo[nowplaying;description_enUS]
• \`$getServerVar[prefix]queue\`
$commandInfo[nowplaying;description_enUS]
• \`$getServerVar[prefix]stop\`
Disconnects $username[$clientID] from its voice channels and clears the queue.||]

$let[desc-enUS;If you need extra information on any command, you can simply use \`$getServerVar[prefix]help\` followed by the command name.
Not all commands are displayed in this menu, but rather the most important ones!]





    `}