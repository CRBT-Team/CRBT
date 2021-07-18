const { links, emojis, colors, items } = require("../../../index");

module.exports.awaitedCommand = {
    name: "noMoney",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{field:$get[your-$getGlobalUserVar[language]]:yes}
$if[$getGlobalUserVar[lastCmd]==buy]
    {field:$get[required-$getGlobalUserVar[language]]:yes}

    $let[required-enUS;Required:${emojis.purplet} **$getObjectProperty[$get[item].value] Purplets**]

    $djsEval[const { items } = require("../../../../../index");
    d.object.banner = items.banners;
    d.object.badge = items.badges;]
    $let[item;$replaceText[$replaceText[$replaceText[$toLowercase[$message];banner ;banner.];badge ;badge.]; ;]]

$endif

{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} You don't have enough Purplets!]
$let[your-enUS;Your current balance:${emojis.purplet} **$getGlobalUserVar[user_bank] Purplets**]
    `}