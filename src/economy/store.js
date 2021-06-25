const { logos, emojis, items, illustrations } = require("../../index");
const badges = items.badges; const banners = items.banners

module.exports.command = {
    name: "store",
    aliases: ["shop"],
    description_enUS: "Brings the CRBT Store up.",
    module: "economy",
    code: `
$reactionCollector[$botLastMessageID;$authorID;1h;${emojis.store.badges},${emojis.store.banners};badges,banners]

$reply[$messageID;

$if[$message==]
    
    {author:$get[title-$getGlobalUserVar[language]]:${logos.CRBTsmall}}
    {field:$get[purplets-$getGlobalUserVar[language]]:no}
    {field:$get[familiarFaces-$getGlobalUserVar[language]]:
    ${badges.goodmeal.contents} ${badges.goodmeal.name}\n**${emojis.general.purplet} ${badges.goodmeal.value} Purplets**
    \`$getServerVar[prefix]buy badge goodmeal\`
    ${badges.udu.contents} ${badges.udu.name}\n**${emojis.general.purplet} ${badges.udu.value} Purplets**
    \`$getServerVar[prefix]buy badge udu\`
    :yes}
    {field:$get[flags-$getGlobalUserVar[language]]:
    ${badges.france.contents} ${badges.france.name}\n**${emojis.general.purplet} ${badges.france.value} Purplets**
    \`$getServerVar[prefix]buy badge france\`
    ${badges.usa.contents} ${badges.usa.name}\n**${emojis.general.purplet} ${badges.usa.value} Purplets**
    \`$getServerVar[prefix]buy badge usa\`
    ${badges.russia.contents} ${badges.russia.name}\n**${emojis.general.purplet} ${badges.russia.value} Purplets**
    \`$getServerVar[prefix]buy badge russia\`
    ${badges.brazil.contents} ${badges.brazil.name}\n**${emojis.general.purplet} ${badges.brazil.value} Purplets**
    \`$getServerVar[prefix]buy badge brazil\`
    :yes}
    {field:$get[jobs-$getGlobalUserVar[language]]:
    ${badges.developer.contents} ${badges.developer.name}\n**${emojis.general.purplet} ${badges.developer.value} Purplets**
    \`$getServerVar[prefix]buy badge developer\`
    :yes}
    {thumbnail:${illustrations.badges}}
    {color:$getGlobalUserVar[color]}
    ;no]

    $let[title-enUS;CRBT Store - Badges (Page 1)]
    $let[purplets-enUS;Balance:${emojis.general.purplet} $getGlobalUserVar[user_bank] Purplets]
    $let[familiarFaces-enUS;Familiar faces]
    $let[flags-enUS;Flags]
    $let[jobs-enUS;Jobs]

$elseIf[$toLowercase[$message]==badges]

    $reply[$messageID;
    {author:}
    ;no]


$endelseIf
$endif
    `}