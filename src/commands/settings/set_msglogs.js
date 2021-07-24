const {emojis,colors} = require("../../../index");

module.exports.command = {
    name: "set_messagelogs",
    aliases: ["set_msglogs","set-msglogs","msglogs","messagelogs","msg_logs","msglogs_channel","please_crbt_let_me_change_the_channel_where_the_message_logs_are_sent"],
    description_enUS: "Changes the message logs channel.",
    usage_enUS: "<#channel>",
    module: "settings",
    userPerms: "manageserver",
    botPerms: "sendmessages",
    code: `
$setServerVar[messagelogs_channel;$mentionedChannels[1]]
$setServerVar[module_messageLogs;true]

$reply[$messageID;
{title:${emojis.success} Message logs channel changed}

{description:
Deleted and edited messages from all members will now show in this channel.
To disable message logging, use \`$getServerVar[prefix]module -messageLogs\`
}

{field:Previous:
$replaceText[$replaceText[$checkCondition[$getServerVar[messagelogs_channel]==$getVar[messagelogs_channel]];true;None];false;<#$getServerVar[messagelogs_channel]>]
:yes}

{field:New:
<#$mentionedChannels[1]>
:yes}

{color:${colors.success}}
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