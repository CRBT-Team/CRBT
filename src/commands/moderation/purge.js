const { emojis, colors } = require("../../../index");

module.exports.command = {
    name: "purge",
    module: "moderation",
    description_enUS: "Clears the specified number of messages in the current channel (100 maximum).",
    usage_enUS: "<number of messages to delete>",
    aliases: ['clear','deletemessages','bulkdelete','bulk'],    
    code: `
$if[$getServerVar[modlogs_channel]!=none]
    
$channelSendMessage[$replaceText[$replaceText[$channelExists[$getServerVar[modlogs_channel]];true;$getServerVar[modlogs_channel]];false;];

{author:$channelName - Message clear}

{field:Moderator:
<@$authorID>
:yes}

{field:Channel:
<#$channelID>
:yes}

{field:Amount cleared:
$message
:no}
    
{color:${colors.success}}
]
$endif
    
$deleteMessage[$get[id]]
$wait[1s]
    
$let[id;$sendMessage[
{title:${emojis.success} $message messages purged.}
{color:${colors.success}}
;yes]]

$clear[$sum[$message;1]]
$deletecommand
    
$onlyIf[$isNumber[$message]==true;{execute:args}]
$onlyIf[$message<=100;{title:${emojis.error} You can only purge up to 100 messages per command!} {color:${colors.error}}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;managemessages]==true;{execute:botPerms}]
$onlyIf[$hasPermsInChannel[$channelID;$authorID;managemessages]==true;{execute:userPerms}]

$argsCheck[1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}