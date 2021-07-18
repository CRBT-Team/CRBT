const {colors, emojis} = require("../../../index");

module.exports.command = {
    name: "autopublish",
    aliases: ["autopublish+","publish","addautopublish","add-autopublishchannel"],
    description_enUS: "Adds a channel to the auto-publish module, which will automatically publish all messages sent within this channel.",
    usage_enUS: "<#channel>",
    module: "settings",
    botPerms: ["manageserver", "managemessages"],
    userPerms: ["manageserver"],
    code: `
$setServerVar[autoPublishedChannels;$getServerVar[autoPublishedChannels]<#$mentionedChannels[1]>]
$setServerVar[module_autoPublish;true]

$reply[$messageID;
{title:${emojis.success} Channel added to the auto-publish module.}

{description:
All messages sent within this channel will now be automatically published.
To undo this action, use \`$getServerVar[prefix]removeautopublish #$channelName[$mentionedChannels[1]]\`.
}

{field:List of auto-published channels:
$replaceText[$getServerVar[autoPublishedChannels];>;>, ]$replaceText[$replaceText[$checkContains[$getServerVar[autoPublishedChannels]==];true;, ];false;]<#$mentionedChannels[1]>
:yes}

{color:${colors.green}}
;no]

$onlyIf[$hasPermsInChannel[$mentionedChannels[1];$clientID;managemessages]==true;{execute:botPerms}]
$onlyBotPerms[manageserver;{execute:botPerms}]
$onlyPerms[manageserver;{execute:admins}]
$onlyIf[$channelType[$mentionedChannels[1;no]]==news;{execute:onlyNewsChannels}]
$onlyIf[$mentionedChannels[1;no]!=;{execute:queryNotFound}]

$onlyIf[$checkContains[$getServerVar[autoPublishedChannels];$mentionedChannels[1]]==false;{execute:alreadyPublished}]

$argsCheck[1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}