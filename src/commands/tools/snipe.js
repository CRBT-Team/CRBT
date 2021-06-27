module.exports.command = {
    name: "snipe",
    module: "tools",
    description_enUS: "Shows the latest deleted ",
    usage_enUS: "<#channel (optional)>",
    code: `
    $reply[$messageID;
    {author:$userTag[$get[author]]:$userAvatar[$get[author]]}
    {description:
$getChannelVar[snipeContent;$mentionedChannels[1;yes]]
}
{footer:In #$channelName[$mentionedChannels[1;yes]]}
{timestamp:$getChannelVar[snipeStamp]}
{color:$getGlobalUserVar[color]}
;no]

$let[author;$getChannelVar[snipeAuthor;$mentionedChannels[1;yes]]]

$onlyIf[$getChannelVar[snipeContent;$mentionedChannels[1;yes]]!=;{title:Error}{color:RED}{description:Theres nothing to snipe in <#$mentionedChannels[1;yes]>}]
    `}

    //stuffs if you want to edit this
    // vars: snipeAuthor, snipeMsg, snipeDate, snipeChannel
    //the last line of code is the error if there is nothing to snipe in the current channel