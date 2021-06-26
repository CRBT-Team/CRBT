const { emojis } = require("../../index");

module.exports.command = {
    name: "balance",
    module: "economy",
    usage_enUS: "<user ID | username | @mention (optional)>",
    description_enUS: "Retrieves the specified user's balance and additional info (or yours, if none is specified).",
    aliases: ["bank", "bal", "money", "credit", "wallet", "purplets"],
    code: `
$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]:$userAvatar[$get[id];64]}

{description:
$get[purplets-$getGlobalUserVar[language]]
$get[lead-$getGlobalUserVar[language]]
$replaceText[$replaceText[$checkCondition[$getGlobalUserVar[job_type]==];true;$get[work-$getGlobalUserVar[language]]];false;]
}

{color:$getGlobalUserVar[color;$get[id]]}
;no]

$let[title-enUS;$userTag[$get[id]] - Wallet]
$let[purplets-enUS;${emojis.general.purplet} **$getGlobalUserVar[user_bank;$get[id]] Purplets**]
$let[lead-enUS;- **$ordinal[$getLeaderboardInfo[user_bank;$get[id];globaluser;top]]** place on the global leaderboard (\`$getServerVar[prefix]leaderboard\`).]
$let[work-enUS;- You haven't got a job! You can get one by using the \`$getServerVar[prefix]job search\` command!]

$if[$message==]
    $let[id;$authorID]
$else
    $let[id;$findUser[$message]]
    $onlyIf[$findUser[$message;no]!=undefined;{execute:usernotfound}]
$endif

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=]$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]$endif
$setGlobalUserVar[lastCmd;$commandName]
    `}