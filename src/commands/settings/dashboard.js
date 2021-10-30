const {illustrations,emojis, links, colors} = require("../../../index");

module.exports.command = {
    name: "dashboard",
    aliases: ["settings", "options"],
    module: "settings",
    description_enUS: "Shows a complete overview of CRBT's settings for you and the server.",
    usage_enUS: "<\"user\" | \"server\">",
    botPerms: "addreactions",
    code: `
$reactionCollector[$get[id];$authorID;1m;👥,📕;duser,dserver;yes]

$editMessage[$get[id];

$if[$message==]

{author:$get[title-$getGlobalUserVar[language]] (Index):${illustrations.settings}}

{description:
To access either the server settings or the user settings, use the corresponding reactions or \`$getServerVar[prefix]dashboard <"server" | "user">\`.
}
{field:Reactions:
👥 User Settings
📕 Server Settings
:no}

$elseIf[$toLowercase[$message]==server]

{author:$get[title-$getGlobalUserVar[language]] (Server):${illustrations.settings}}
$get[server]

$endelseIf
$elseIf[$toLowercase[$message]==user]

{author:$get[title-$getGlobalUserVar[language]] (User):${illustrations.settings}}
$get[user]    

$endelseIf
$endif

{color:$getGlobalUserVar[color]}
;$channelID]

$let[id;$apiMessage[$channelID;;
{title:Loading...}
{color:${colors.orange}}
;;$messageID:false;yes]]


$let[title-enUS;CRBT Settings - Dashboard]

$let[server;
{field:Prefix:
Set to \`$getServerVar[prefix]\`. (default: \`$getVar[prefix]\`)
Changes $username[$clientID]'s prefix across all commands.
Change it with \`$getServerVar[prefix]prefix <new prefix>\`.
:no}

{field:Muted role:
$replaceText[$replaceText[$checkCondition[$getServerVar[muted_role]==$getVar[muted_role]];false;Set to <@&$getServerVar[muted_role]>];true;None was set yet].
Changes the role given to a user muted with the \`$getServerVar[prefix]mute\` command.
Change it with \`$getServerVar[prefix]mutedrole <role>\`
:no}

{field:Auto-published channels:
$replaceText[$replaceText[$getServerVar[module_autoPublish]
;true;Automatically publish messages sent in announcement channels.
$replaceText[${emojis.toggle.on};:;#COLON#] Enabled
**Current list:**
$replaceText[$getServerVar[autoPublishedChannels];>;>, ]$replaceText[$replaceText[$checkContains[$getServerVar[autoPublishedChannels]==];true;, ];false;]
Add more with \`$getServerVar[prefix]autopublish <channel>\` and remove them with \`$getServerVar[prefix]unpublish <channel>\`.]
;false;Automatically publish messages sent in announcement channels.
$replaceText[${emojis.toggle.off};:;#COLON#] Disabled
Enable it and add channels with \`$getServerVar[prefix]autopublish <channel>\`]
}

{field:Message logs:
$replaceText[$replaceText[$getServerVar[module_messageLogs]
;true;$replaceText[${emojis.toggle.on};:;#COLON#] Enabled
Sent to <#$getServerVar[messagelogs_channel]>
Change it with \`$getServerVar[prefix]messagelogs <channel>\`
Disable it with \`$getServerVar[prefix]module disable messagelogs\`]
;false;$replaceText[${emojis.toggle.off};:;#COLON#] Disabled
Enable it with \`$getServerVar[prefix]messagelogs <channel>\`]
:yes}

{field:Moderation logs:
$replaceText[$replaceText[$getServerVar[module_modLogs]
;true;$replaceText[${emojis.toggle.on};:;#COLON#] Enabled
Sent to <#$getServerVar[modlogs_channel]>
Change it with \`$getServerVar[prefix]modlogs <channel>\`
Disable it with \`$getServerVar[prefix]module disable modlogs\`]
;false;$replaceText[${emojis.toggle.off};:;#COLON#] Disabled
Enable it with \`$getServerVar[prefix]modlogs <channel>\`]
:yes}

{field:Member logs:
$replaceText[$replaceText[$getServerVar[module_memberLogs]
;true;$replaceText[${emojis.toggle.on};:;#COLON#] Enabled
Sent to <#$getServerVar[memberlogs_channel]>
Change it with \`$getServerVar[prefix]memberlogs <channel>\`
Disable it with \`$getServerVar[prefix]module disable memberlogs\`]
;false;$replaceText[${emojis.toggle.off};:;#COLON#] Disabled
Enable it with \`$getServerVar[prefix]memberlogs <channel>\`]
:yes}
]

$let[user;
{field:Language:
Set to English (American) - \`$getGlobalUserVar[language]\`.
Changes $username[$clientID]'s language for when you use it.
Not changeable at the moment.
:no}

{field:Accent color:
Set to \`#$getGlobalUserVar[color]\`.
Changes the color of most embeds for commands you use with CRBT.
Change it with \`$getServerVar[prefix]color\`
:no}

{field:Telemetry:
${emojis.toggle.fon} Enabled
**Note:** Since the August 2021 update, telemetry features can no longer be disabled.
You can read CRBT's privacy policy **[here](${links.privacypolicy})**.
:no}

{thumbnail:https://api.clembs.xyz/other/color/$getGlobalUserVar[color]}
]

$onlyIf[$checkContains[$checkCondition[$toLowercase[$message]==]$checkCondition[$toLowercase[$message]==server]$checkCondition[$toLowercase[$message]==user];true]==true;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
    `}