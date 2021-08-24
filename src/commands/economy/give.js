const { colors, emojis } = require("../../../index");

module.exports.command = {
    name: "give",
    module: "economy",
    aliases: ["givemoney", "share", "give-money", "pay"],
    usage_enUS: "<user ID | username | @mention> <amount of Purplets to give | all>",
    description_enUS: "Allows you to give a fixed amount of Purplets to the specified user",
    slashCmd: 'give user:<arg1> amount:<arg2>',
    code: `
$setGlobalUserVar[user_bank;$sum[$getGlobalUserVar[user_bank;$get[id]];$get[amount]];$get[id]]
$setGlobalUserVar[user_bank;$sub[$getGlobalUserVar[user_bank;$authorID];$get[amount]];$authorID]

$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}
{description:$get[description-$getGlobalUserVar[language]]}
{field:$get[you-$getGlobalUserVar[language]]:yes}
{field:$get[them-$getGlobalUserVar[language]]:yes}
{color:${colors.success}}
;no]


$let[title-enUS;${emojis.success} Purplets transfer]
$let[description-enUS;You successfully gave **${emojis.purplet} $get[amount] Purplets** to <@!$get[id]>.]
$let[you-enUS;Your balance:Previous: **${emojis.purplet} $getGlobalUserVar[user_bank]**\nNew: **${emojis.purplet} $sub[$getGlobalUserVar[user_bank];$get[amount]]**]
$let[them-enUS;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$getGlobalUserVar[profilePronouns;$get[id]];he him;His];she her;Her];they them;Their];ask;$username[$get[id]]'s];username;$username[$get[id]]'s];any;Their];unspecified;Their];other;$username[$get[id]]'s] balance:Previous: **${emojis.purplet} $getGlobalUserVar[user_bank;$get[id]]**\nNew: **${emojis.purplet} $sum[$getGlobalUserVar[user_bank;$get[id]];$get[amount]]**]

$onlyIf[$get[amount]>0;{execute:belowZero}]
$onlyIf[$get[amount]!=0;{execute:belowZero}]
$onlyIf[$isBot[$get[id]]==false;{execute:giveNotBots}]
$onlyIf[$get[amount]<=$getGlobalUserVar[user_bank];{execute:noMoney}]
$onlyIf[$getGlobalUserVar[user_bank]>0;{execute:noMoney}]
$onlyIf[$get[id]!=$authorID;{execute:giveNotYou}]
$onlyIf[$getGlobalUserVar[blocklisted;$get[id]]==false;{execute:userBlocklisted}]
$onlyIf[$isNumber[$get[amount]]==true;{execute:args}]
$onlyIf[$get[id]!=undefined;{execute:args}]
$onlyIf[$checkContains[$toLowercase[$message[2]];dollidot]==false;as far as we know, you can't give dollidots (yet)]

$let[amount;$round[$replaceText[$toLowercase[$message[2]];all;$getGlobalUserVar[user_bank]]]]
$let[id;$findUser[$message[1];no]]

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$guildID!=;{execute:guildOnly}]
    `}