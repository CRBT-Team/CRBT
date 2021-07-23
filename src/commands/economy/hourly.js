const { emojis, colors } = require("../../../index");

module.exports.command = {
    name: "hourly",
    aliases: ["hourlies", "hour", "h"],
    module: "economy",
    description_enUS: "Claim a few Purplets, and make your streak go higher each time to win a bonus!",
    cooldown: "1h",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}

$if[$getGlobalUserVar[hourly_streak]<4]

    $setGlobalUserVar[hourly_streak;$sum[$getGlobalUserVar[hourly_streak];1]]
    $setGlobalUserVar[user_bank;$sum[$getGlobalUserVar[user_bank];$random[20;50]]]

    {description:$get[description1-$getGlobalUserVar[language]]}

$elseIf[$getGlobalUserVar[hourly_streak]==4]

  $deleteGlobalUserVar[hourly_streak]
  $setGlobalUserVar[user_bank;$sum[$getGlobalUserVar[user_bank];100]]

    {description:$get[description2-$getGlobalUserVar[language]]}

$endelseIf
$endif

{color:${colors.success}}
;no]

$let[title-enUS;${emojis.success} Hourly Purplets]
$let[description1-enUS;You claimed your hourly ${emojis.purplet} **$random[20;50] Purplets**.
Current streak: **$sum[$getGlobalUserVar[hourly_streak];1]/5** ($math[5-($getGlobalUserVar[hourly_streak]+1)] streak$replaceText[$replaceText[$checkCondition[$math[5-($getGlobalUserVar[hourly_streak]+1)]==1];true;s];false;] left for a bonus!)]
$let[description2-enUS;You claimed your hourly ${emojis.purplet} **100 Purplets**. (Streak of 5 bonus!)]

$globalCooldown[$commandInfo[$commandName;cooldown];{execute:cooldown}]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}