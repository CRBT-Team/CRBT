const { emojis } = require("../../../index");
module.exports.command = {
    name: "leaderboard",
    module: "economy",
    aliases: ["lb", "lead"],
    code: `
$reply[$messageID;
{title:Purplets global leaderboard}

{description:
$globalUserLeaderboard[user_bank;asc;**{top}.** {username} - {value} Purplets;yes;1]
}

{field:Your position:
**$getLeaderboardInfo[user_bank;$authorID;globaluser;top].** $username - ${emojis.purplet} $getLeaderboardInfo[user_bank;$authorID;globaluser;value] Purplets
}

{color:$getGlobalUserVar[color]}
;no]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$getGlobalUserVar[experimentalFeatures]==true;{execute:experimentalFeatures}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
    `}