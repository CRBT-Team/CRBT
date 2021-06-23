const { logos, emojis, items } = require("../../index");
const badges = items.badges; const banners = items.banners

module.exports.command = {
    name: "store",
    aliases: ["shop"],
    description_enUS: "Brings the CRBT Store up.",
    module: "economy",
    code: `
$reactionCollector[$botLastMessageID;$authorID;1h;📛,🏴;badges,banners]

$reply[$messageID;

$if[$message==]
    
    {author:$get[title-$getGlobalUserVar[language]]:${logos.CRBTsmall}}
    {field:$get[purplets-$getGlobalUserVar[language]]:no}
    {field:$get[familiarFaces-$getGlobalUserVar[language]]:
    ${badges.goodmeal.contents} ${badges.goodmeal.name} - **${emojis.general.purplet} ${badges.goodmeal.value}**
    \`$getServerVar[prefix]buy badge goodmeal\`
    ${badges.udu.contents} ${badges.udu.name} - **${emojis.general.purplet} ${badges.udu.value}**
    \`$getServerVar[prefix]buy badge udu\`
    :yes}
    {field:$get[flags-$getGlobalUserVar[language]]:
    ${badges.france.contents} ${badges.france.name} - **${emojis.general.purplet} ${badges.france.value}**
    \`$getServerVar[prefix]buy badge france\`
    ${badges.usa.contents} ${badges.usa.name} - **${emojis.general.purplet} ${badges.usa.value}**
    \`$getServerVar[prefix]buy badge usa\`
    ${badges.russia.contents} ${badges.russia.name} - **${emojis.general.purplet} ${badges.russia.value}**
    \`$getServerVar[prefix]buy badge russia\`
    ${badges.brazil.contents} ${badges.brazil.name} - **${emojis.general.purplet} ${badges.brazil.value}**
    \`$getServerVar[prefix]buy badge brazil\`
    :yes}
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