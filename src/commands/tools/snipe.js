module.exports.command = {
    name: "snipe",
    module: "moderation",
    description_enUS: "Shows the contents of the latest deleted message in the current channel.",
    usage_enUS: "<channel ID/channel name/#mention (optional)>",
    userPerms: "kick",
    code: `
    $reply[$messageID;
    {thumbnail:$userAvatar[$getChannelVar[snipeAuthor;$mentionedChannels[1;yes]]]}
    {color:$getGlobalUserVar[color]}
    {title:Message Sniped Succesfully!}
    {description:
sniped message:
\`\`\`$getChannelVar[snipeMsg;$mentionedChannels[1;yes]]\`\`\`

deleted on $replaceText[$replaceText[$getChannelVar[snipeDate];.;/];-;at]
sent by: $userTag[$getChannelVar[snipeAuthor;$mentionedChannels[1;yes]]]
}
{footer:In #$channelName[$splitText[2]]}
{timestamp:$splitText[3]}
{color:$getGlobalUserVar[color]}
;no]

$let[author;$splitText[1]]

$onlyIf[$getChannelVar[snipeContent;$get[id]]!=;{execute:snipeEmpty}]

$textSplit[$getChannelVar[snipeDetails;$get[id]];//]

$if[$message==]
    $let[id;$channelID]
$else
    $onlyIf[$hasPermsInChannel[$get[id];$clientID;readmessages]==true;{execute:cantReadChannel}]
    $let[id;$findServerChannel[$message]]
    $onlyIf[$findServerChannel[$message;no]!=undefined;{execute:args}]
$endif

$onlyIf[$hasPerms[$authorID;kick]==true;{execute:onlymods}]
    `}
