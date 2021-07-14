const {emojis,colors} = require("../../../index");

module.exports.command = {
    name: "set_modlogs",
    aliases: ["set_modlogs","modlogs","modlogs","mod_logs","modlogs_channel"],
    description_enUS: "Changes the moderation logs channel.",
    usage_enUS: "<#channel>",
    module: "settings",
    userPerms: "manageserver",
    botPerms: "sendmessages",
    code: `
$setServerVar[modlogs_channel;$mentionedChannels[1]]
$setServerVar[module_modLogs;true]

$reply[$messageID;
{title:${emojis.general.success} Moderation logs channel changed}

{description:
New moderation actions using $username[$clientID] will now show in this channel.
To stop receiving moderation logs in this channel, use \`$getServerVar[prefix]module -modLogs\`
}

{field:Previous:
$replaceText[$replaceText[$checkCondition[$getServerVar[modlogs_channel]==$getVar[modlogs_channel]];true;None];false;<#$getServerVar[modlogs_channel]>]
:yes}

{field:New:
<#$mentionedChannels[1]>
:yes}

{color:${colors.green}}
;no]

$onlyIf[$hasPermsInChannel[$mentionedChannels[1];$clientID;sendmessages]==true;{execute:botPerms}]
$onlyPerms[manageserver;{execute:admins}]
$onlyIf[$mentionedChannels[1]!=;{execute:channelNotFound}]

$argsCheck[1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}