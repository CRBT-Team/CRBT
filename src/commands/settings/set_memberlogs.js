const { emojis, colors } = require('../../..');

module.exports.command = {
  name: "set_memberlogs",
  aliases: ["set_memberlogs","memberlogs","memberlogs","mod_logs","memberlogs_channel"],
  description_enUS: "Changes the member logs channel.",
  usage_enUS: "<#channel>",
  module: "settings",
  userPerms: "manageserver",
  botPerms: "sendmessages",
  code: `
$setServerVar[memberlogs_channel;$mentionedChannels[1]]
$setServerVar[module_memberLogs;true]

$reply[$messageID;
{title:${emojis.success} Member logs channel changed}

{description:
Logs will be sent whenever a user joins or leaves the server.
To stop receiving member logs in this channel, use \`$getServerVar[prefix]module -memberLogs\`
}

{field:Previous:
$replaceText[$replaceText[$checkCondition[$getServerVar[memberlogs_channel]==$getVar[memberlogs_channel]];true;None];false;<#$getServerVar[memberlogs_channel]>]
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