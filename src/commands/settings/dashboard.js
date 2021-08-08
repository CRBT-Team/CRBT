const {illustrations,emojis} = require("../../../index");

module.exports.command = {
    name: "dashboard",
    aliases: ["settings", "options"],
    module: "settings",
    description_enUS: "Shows a complete overview of CRBT's settings for you and the server.",
    usage_enUS: "<\"user\" | \"server\">",
    botPerms: "addreactions",
    code: `
$if[$message==]

    $reactionCollector[$botLastMessageID;$authorID;1s;👥,📕;user,server;yes]

    $reply[$messageID;
    {author:$get[title-$getGlobalUserVar[language]] (Index):${illustrations.settings}}

{description:
To access either the server settings or the user settings, use the corresponding reactions or \`$getServerVar[prefix]dashboard <"server" | "user">\`.
}
{field:Reactions:
👥 User Settings
📕 Server Settings
:no}
 
    {color:$getGlobalUserVar[color]}
    ;no]

$elseIf[$toLowercase[$message]==server]

    $reply[$messageID;
    {author:$get[title-$getGlobalUserVar[language]] (Server):${illustrations.settings}}

$get[server]

    {color:$getGlobalUserVar[color]}
    ;no]
$endelseIf
$elseIf[$toLowercase[$message]==user]

    $reply[$messageID;
    {author:$get[title-$getGlobalUserVar[language]] (User):${illustrations.settings}}

$get[user]
    
    {color:$getGlobalUserVar[color]}
;no]
$endelseIf
$else
    $loop[1;args]
$endif

$let[title-enUS;CRBT Settings - Dashboard]

$let[server;
{field:Prefix:
Set to \`$getServerVar[prefix]\`. (default: \`$getVar[prefix]\`)
Changes $username[$clientID]'s prefix across all commands.
Change it with \`$getServerVar[prefix]prefix <new prefix>\`.
:no}

{field:Volume:
Set to \`$round[$math[$getServerVar[volume]/2]]%\`
Changes the volume of the music playback.
Change it with \`$getServerVar[prefix]volume $commandInfo[vol;usage_$getGlobalUserVar[language]]\`
:no}

{field:Muted role:
$replaceText[$replaceText[$checkCondition[$getServerVar[muted_role]==$getVar[muted_role]];false;Set to <@&$getServerVar[muted_role]>];true;None was set yet].
Changes the role given to a user muted with the \`$getServerVar[prefix]mute\` command.
Change it with \`$getServerVar[prefix]mutedrole <role>\`
:no}

{field:Message logs:
$replaceText[$replaceText[$getServerVar[module_messageLogs]
;true;$replaceText[${emojis.toggleon};:;#COLON#] Enabled
Sent to <#$getServerVar[messagelogs_channel]>
Change it with \`$getServerVar[prefix]messagelogs <channel>\`
Disable it with \`$getServerVar[prefix]module disable messagelogs\`]
;false;$replaceText[${emojis.toggleoff};:;#COLON#] Disabled
Enable it with \`$getServerVar[prefix]messagelogs <channel>\`]
:yes}

{field:Moderation logs:
$replaceText[$replaceText[$getServerVar[module_modLogs]
;true;$replaceText[${emojis.toggleon};:;#COLON#] Enabled
Sent to <#$getServerVar[modlogs_channel]>
Change it with \`$getServerVar[prefix]modlogs <channel>\`
Disable it with \`$getServerVar[prefix]module disable modlogs\`]
;false;$replaceText[${emojis.toggleoff};:;#COLON#] Disabled
Enable it with \`$getServerVar[prefix]modlogs <channel>\`]
:yes}
]

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}