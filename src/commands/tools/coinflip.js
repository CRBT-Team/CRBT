const { emojis } = require("../../../index");

module.exports.command = {
    name: "coinflip",
    aliases: ["cointoss", "coin-flip", "flipcoin", "tosscoin", "coin-toss", "cf", 'ct', "coin"],
    module: "tools",
    description_enUS: "Flips a Purplet that either lands on heads or tails.",
    code: `
$editMessage[$get[id];
{title:$get[result-$getGlobalUserVar[language]]}
{image:$replaceText[$replaceText[$replaceText[$get[random];heads;https://cdn.clembs.xyz/zBYEdTb.png];tails;https://cdn.clembs.xyz/WsyQVPX.png];side;https://cdn.clembs.xyz/Kkeq1eD.png]}
{color:$getGlobalUserVar[color]}
;$channelID]

$wait[2s]

$let[id;$botLastMessageID]
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}
{image:https://clembs.xyz/media/placeholder-image.png}
{color:$getGlobalUserVar[color]}
;no]

$let[result-enUS;${emojis.general.purplet} Landed $replaceText[$replaceText[$replaceText[$get[random];tails;on tails];heads;on heads];side;sideways]!]
$let[title-enUS;${emojis.general.purplet} Flipping Purplet...]

$let[random;$randomText[tails;tails;tails;tails;tails;heads;heads;heads;heads;heads;side]]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=]$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]$endif
$setGlobalUserVar[lastCmd;$commandName]
    `}