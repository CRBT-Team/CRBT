const { links, illustrations } = require("../../index");

module.exports.botJoinCommand = {
    channel: "$systemChannelID",
    code: `
$if[$hasPermsInChannel[$systemChannelID;$clientID;sendmessages]==true]
$sendMessage[
{title:Thanks for inviting $username[$clientID] to your server!}

{description:
$username[$clientID] is now on $serverCount servers!
• If you aren't experienced with it, consider typing \`$getServerVar[prefix]help\`.
• To set the bot up and to change its settings, use \`$getServerVar[prefix]dashboard\`.
• If you need more help, please check [the website](${links.baseURL}).
}

{image:${illustrations.welcome}}

{color:$getVar[color]}
;no]
$else
$sendDM[$ownerID;
{title:Thanks for inviting $username[$clientID] to your server!}

{description:
$username[$clientID] is now on $serverCount servers!
• If you aren't experienced with it, consider typing \`$getServerVar[prefix]help\`.
• To set the bot up and to change its settings, use \`$getServerVar[prefix]dashboard\`.
• If you need more help, please check [the website](${links.baseURL}).
}

{image:${illustrations.welcome}}

{color:$getVar[color]}
]
$endif
`}