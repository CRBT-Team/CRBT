module.exports.command = {
    name: "snipe",
    module: "moderation",
    description_enUS: "Shows the contents of the latest deleted message in the current channel.",
    usage_enUS: "<channel ID/channel name/#mention (optional)>",
    code: `
$reply[$messageID;
{author:$userTag[$get[author]]:$userAvatar[$get[author]]}
{description:
$getChannelVar[snipeContent;$get[id]]
}
{footer:In #$channelName[$get[id]]}
{timestamp:$getChannelVar[snipeStamp]}
{color:$getGlobalUserVar[color]}
;no]

$let[author;$getChannelVar[snipeAuthor;$get[id]]]

$onlyIf[$getChannelVar[snipeContent;$get[id]]!=;{execute:snipeEmpty}]

$if[$message==]
    $let[id;$channelID]
$else
    $onlyIf[$hasPermsInChannel[$get[id];$clientID;readmessages]==true;{execute:cantReadChannel}]
    $let[id;$findServerChannel[$message]]
    $onlyIf[$findServerChannel[$message;no]!=undefined;{execute:args}]
$endif

$onlyIf[$hasPerms[$authorID;kick]==true;{execute:onlymods}]

    `}

    //stuffs if you want to edit this
    // vars: snipeAuthor, snipeMsg, snipeDate, snipeChannel
    //the last line of code is the error if there is nothing to snipe in the current channel