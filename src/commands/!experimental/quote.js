module.exports.command = {
    name: "quote",
    code: `
$reply[$messageID;
{author:$userTag[$get[id]]:$userAvatar[$get[id];64]}
{description:$get[content]}
{color:$getGlobalUserVar[color;$get[id]]}
{field:Link:
[Jump to message]($message)
:no}
{footer:$replaceText[$replaceText[$channelExists[$get[channel]];true;#$channel[$get[channel];name] ($channel[$get[channel];guildname])];false;]}
;no]

$let[content;$getMessage[$splitText[2];$splitText[3];content]]
$let[id;$getMessage[$splitText[2];$splitText[3];userID]]
$let[channel;$splitText[2]]

$onlyIf[$hasPermsInChannel[$splitText[2];$clientID;viewchannel]==true;{execute:botPerms}]

$onlyIf[$serverExists[$splitText[1]]==true;cant access server]

$textSplit[$replaceText[$replaceText[$replaceText[$replaceText[$message;discord.com/channels/;];canary.;];ptb.;];https://;];/]

$onlyIf[$checkContains[$stringStartsWith[$message;https://discord.com/channels/]$stringStartsWith[$message;https://ptb.discord.com/channels/]$stringStartsWith[$message;https://canary.discord.com/channels/];true]==true;not a valid link xd]


$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$getGlobalUserVar[experimentalFeatures]==true;{execute:experimentalFeatures}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
    `}