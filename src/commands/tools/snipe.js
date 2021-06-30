module.exports.command = {
    name: "snipe",
    module: "moderation",
    description_enUS: "Shows the contents of the latest deleted message in the current channel.",
    usage_enUS: "<channel ID/channel name/#mention (optional)>",
    userPerms: "kick",
    code: `
$reply[$messageID;
{author:$userTag[$get[author]]:$userAvatar[$get[author]]}
{description:
$getChannelVar[snipeContent;$get[id]]
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