module.exports.command = {
    name: "snipe",
    module: "tools",
    description_enUS: "Shows the latest deleted ",
    usage_enUS: "snipe",
    botperms: [""],
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
;no]


$onlyIf[$getChannelVar[snipeMsg;$mentionedChannels[1;yes]]!=;{title:Error}{color:RED}{description:Theres nothing to snipe in <#$mentionedChannels[1;yes]>}]
    `
    };

    //stuffs if you want to edit this
    // vars: snipeAuthor, snipeMsg, snipeDate, snipeChannel
    //the last line of code is the error if there is nothing to snipe in the current channel