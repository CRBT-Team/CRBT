const {colors, emojis} = require("../../../index");

module.exports.command = {
    name: "lock",
    module: "moderation",
    aliases: ["lockdown", "stopchat", "lockchat", "unlock", "unlockdown", "revivechat", "unlockchat"],
    description_enUS: "Toggles the \"Send messages\" permission for @everyone in the current channel.",
    usage_enUS: "<reason (optional)>",
    botPerms: "manageroles",
    code: `
$if[$getChannelVar[locked]==false]

$setChannelVar[locked;true]

$channelSendMessage[$replaceText[$getServerVar[modlogs_channel];none;$channelID];

{author:#$channelName - Lock}

{field:Channel:
<#$channelID>
:yes}

{field:Moderator:
<@!$authorID>
:yes}

{field:Reason:
$replaceText[$replaceText[$checkCondition[$messageSlice[1]==];true;Unspecified];false;$replaceText[$messageSlice[1];|;]]
:no}

{color:${colors.orange}}
]

$modifyChannelPerms[$channelID;-sendmessages;$guildID]

$reply[$messageID;
{title:${emojis.success} Disabled the "Send messages" permission for @everyone on #$channelName.} 
{color:${colors.success}}
;no]

$else

$setChannelVar[locked;$getVar[locked]]

$channelSendMessage[$replaceText[$getServerVar[modlogs_channel];none;$channelID];

{author:#$channelName - Unlock}

{field:Channel:
<#$channelID>
:yes}

{field:Moderator:
<@!$authorID>
:yes}

{color:${colors.green}}
]

$modifyChannelPerms[$channelID;+sendmessages;$guildID]

$reply[$messageID;
{title:${emojis.success} Enabled the "Send messages" permission for @everyone on #$channelName.} 
{color:${colors.success}}
;no]

$endif

$onlyBotPerms[manageroles;{execute:botPerms}]
$onlyIf[$checkContains[$hasPerms[$authorID;managemessages]$hasPerms[$authorID;manageserver]$checkContains[$toLowercase[$userRoles];crbt mod];true]==true;{execute:mods}]

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}