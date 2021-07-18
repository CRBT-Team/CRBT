const { emojis, colors } = require("../../../index");

module.exports.command = {
    name: "buy",
    aliases: ["purchase", "acquire"],
    module: "economy",
    description_enUS: "Spends your Purplets on a specified item.",
    usage_enUS: "<item name (e.g. \"badge flushed\" or \"banner stripes\")>",
    code: `
$setGlobalUserVar[inv$toLowercase[$message[1]];$getGlobalUserVar[inv$toLowercase[$message[1]]], $toLowercase[$message[1]] $replaceText[$toLowercase[$messageSlice[1]]; ;]]
$setGlobalUserVar[user_bank;$math[$getGlobalUserVar[user_bank]-$getObjectProperty[$get[item].value]]]

$reply[$messageID;
{title:${emojis.success} Purchase successful}

{description:
You have bought the $getObjectProperty[$get[item].name] $toLowercase[$message[1]] for ${emojis.purplet} **$getObjectProperty[$get[item].value] Purplets**.
You can use it with \`$getServerVar[prefix]$toLowercase[$message[1]] $replaceText[$toLowercase[$messageSlice[1]]; ;]\` and access your inventory with \`$getServerVar[prefix]inventory\`.
}
{color:${colors.success}}
;no]

$onlyIf[$getGlobalUserVar[user_bank]>=$getObjectProperty[$get[item].value];{execute:noMoney}]

$onlyIf[$getObjectProperty[$get[item].available]==true;{execute:specialItem}]

$onlyIf[$getObjectProperty[$get[item].name]!=CRBT Partner;{execute:partnerNotSale}]

$onlyIf[$getObjectProperty[$get[item].contents]!=;{execute:unknownItem}]

$onlyIf[$checkContains[$getGlobalUserVar[inv$toLowercase[$message[1]]];$toLowercase[$message[1]] $replaceText[$toLowercase[$messageSlice[1]]; ;]]==false;{execute:itemInInv}]

$let[item;$replaceText[$replaceText[$replaceText[$toLowercase[$message];banner ;banner.];badge ;badge.]; ;]]

$onlyIf[$checkContains[$toLowercase[$message[1]];badge;banner]==true;{execute:unknownItem}]

$djsEval[const { items } = require("../../../../../index");
d.object.banner = items.banners;
d.object.badge = items.badges;]

$argsCheck[>2;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}