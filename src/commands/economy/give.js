const { colors, emojis } = require("../../../index");

module.exports.command = {
    name: "give",
    module: "economy",
    aliases: ["givemoney", "share", "give-money", "pay"],
    usage_enUS: "<@mention> <amount of Purplets to give | all>",
    description_enUS: "Allows you to give a fixed amount of Purplets to y",
    code: `
$setGlobalUserVar[user_bank;$sum[$getGlobalUserVar[user_bank;$get[person]];$get[amount]];$get[person]]
$setGlobalUserVar[user_bank;$sub[$getGlobalUserVar[user_bank;$authorID];$get[amount]];$authorID]

$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}
{description:$get[description-$getGlobalUserVar[language]]}
{field:$get[you-$getGlobalUserVar[language]]:yes}
{field:$get[them-$getGlobalUserVar[language]]:yes}
{color:${colors.success}}
;no]


$let[title-enUS;${emojis.general.success} Purplets transfer]
$let[description-enUS;You successfully gave **${emojis.general.purplet} $get[amount] Purplets** to <@!$get[person]>.]
$let[you-enUS;Your balance:Previous: **${emojis.general.purplet} $getGlobalUserVar[user_bank]**\nNew: **${emojis.general.purplet} $sub[$getGlobalUserVar[user_bank];$get[amount]]**]
$let[them-enUS;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$getGlobalUserVar[profilePronouns;$get[person]];he him;His];she her;Her];they them;Their];ask;$username[$get[person]]'s];username;$username[$get[person]]'s];any;Their];unspecified;Their];other;$username[$get[person]]'s] balance:Previous: **${emojis.general.purplet} $getGlobalUserVar[user_bank;$get[person]]**\nNew: **${emojis.general.purplet} $sum[$getGlobalUserVar[user_bank;$get[person]];$get[amount]]**]

$onlyIf[$get[amount]>0;{execute:belowZero}]
$onlyIf[$get[amount]!=0;{execute:belowZero}]
$onlyIf[$isBot[$get[person]]==false;{execute:giveNotBots}]
$onlyIf[$get[amount]<=$getGlobalUserVar[user_bank];{execute:noMoney}]
$onlyIf[$getGlobalUserVar[user_bank]>0;{execute:noMoney}]
$onlyIf[$get[person]!=$authorID;{execute:giveNotYou}]
$onlyIf[$getGlobalUserVar[blocklisted;$get[person]]==false;{execute:giveNotBlocklist}]
$onlyIf[$isNumber[$get[amount]]==true;{execute:args}]
$onlyIf[$get[person]!=;{execute:args}]
$argsCheck[2;{execute:args}]
$onlyIf[$checkContains[$toLowercase[$message];dollidot]==false;as far as we know, you can't give dollidots (yet)]

$let[amount;$replaceText[$toLowercase[$noMentionMessage];all;$getGlobalUserVar[user_bank]]]
$let[person;$mentioned[1]]

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=]$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]$endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$guildID!=;{execute:guildOnly}]
    `}

/*
$let[person;$findUser[$replaceText[$toLowercase[$message];all;$getGlobalUserVar[user_bank]];$findNumbers[$replaceText[$toLowercase[$noMentionMessage];all;$getGlobalUserVar[user_bank]];no]]
$let[amount;$round[$findNumbers[$replaceText[$toLowercase[$noMentionMessage];all;$getGlobalUserVar[user_bank]]]]]
*/