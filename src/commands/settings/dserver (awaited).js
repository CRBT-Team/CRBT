const { links, emojis, illustrations } = require("../../../index");

module.exports.awaitedCommand = {
    name: "dserver",
    code: `
$editMessage[$message[1];
    {author:$get[title-$getGlobalUserVar[language]] (Server):${illustrations.settings}}

$get[server]
    
    {color:$getGlobalUserVar[color]}
;$channelID]

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

    `}