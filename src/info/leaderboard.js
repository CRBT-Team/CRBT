const { emojis } = require("../../index");
module.exports.command = {
    name: "leaderboard",
    module: "economy",
    code: `
$reply[$messageID;
{title:Purplets global leaderboard}

{description:
$globalUserLeaderboard[user_bank;;**{top}.** {username} - ${emojis.general.purplet} {value} Purplets]
}

{field:Your position:
**$getLeaderboardInfo[user_bank;$authorID;globaluser;top].** $username - ${emojis.general.purplet} $getLeaderboardInfo[user_bank;$authorID;globaluser;value] Purplets
}

{color:$getGlobalUserVar[color]}
;no]
    `}