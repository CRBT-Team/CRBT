module.exports.command = {
    name: "quote",
    module: "experimental",
    usage_enUS: "<message link>",
    examples_enUS: [
        "quote https://discord.com/channels/738747595438030888/738747595438030891/827232741665013831"
    ],
    code: `
$reply[$messageID;
{author:$replaceText[$replaceText[$get[pinned];true;📌 ];false;]$userTag[$get[id]]:$userAvatar[$get[id];64]}

{description:
$get[content]
}

{field:Link:
[Jump to message]($get[url])
:no}

{field:Sent:
<t:$get[timestamp]> (<t:$get[timestamp]:R>)
:no}

{footer:#$msg[$get[channel];$get[msg];channelname] ($get[guild])}
{color:$getGlobalUserVar[color;$get[id]]}
;no]

$let[url;$msg[$get[channel];$get[msg];url]]
$let[guild;$msg[$get[channel];$get[msg];guildname]]
$let[timestamp;$formatDate[$msg[$get[channel];$get[msg];created];X]]
$let[pinned;$msg[$get[channel];$get[msg];ispinned]]
$let[content;$msg[$get[channel];$get[msg];content]]
$let[id;$msg[$get[channel];$get[msg];author]]

$onlyIf[$hasPermsInChannel[$get[channel];$clientID;viewchannel]==true;{execute:botPerms}]

$let[channel;$splitText[2]]
$let[msg;$splitText[3]]

$onlyIf[$serverExists[$splitText[1]]==true;cant access server]

$textSplit[$replaceText[$replaceText[$replaceText[$replaceText[$message;discord.com/channels/;];canary.;];ptb.;];https://;];/]

$onlyIf[$checkContains[$stringStartsWith[$message;https://discord.com/channels/]$stringStartsWith[$message;https://ptb.discord.com/channels/]$stringStartsWith[$message;https://canary.discord.com/channels/];true]==true;{execute:args}]

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getGlobalUserVar[experimentalFeatures]==true;{execute:experimentalFeatures}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
    `}