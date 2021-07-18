const {colors, emojis} = require("../../../index");

module.exports.command = {
    name: "removeautopublish",
    aliases: ["autopublish-", "unpublish", "remove-autopublishchannel"],
    description_enUS: "Removes a channel from the auto-publish module, which will no longer autopublish messages sent in this channel.",
    usage_enUS: "<#channel>",
    module: "settings",
    userPerms: "manageserver",
    code: `
$setServerVar[autoPublishedChannels;$replaceText[$getServerVar[autoPublishedChannels];<#$mentionedChannels[1]>;]]

$reply[$messageID;
{title:${emojis.success} Channel removed from the auto-publish module.}

{description:
All messages sent within this channel will no longer be automatically published.
To completely disable auto-publishing, use \`$getServerVar[prefix]module disable autoPublish\`.
}

{field:List of auto-published channels:
$replaceText[$replaceText[$getServerVar[autoPublishedChannels];<#$mentionedChannels[1]>;];>;>, ]$replaceText[$replaceText[$checkContains[$replaceText[$getServerVar[autoPublishedChannels];<#$mentionedChannels[1]>;]==];true;, ];false;]
:yes}

{color:${colors.green}}
;no]

$onlyPerms[manageserver;{execute:admins}]
$onlyIf[$mentionedChannels[1;no]!=;{execute:queryNotFound}]
$onlyIf[$checkContains[$getServerVar[autoPublishedChannels];$mentionedChannels[1]]==true;{execute:notAlreadyPublished}]

$argsCheck[1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}