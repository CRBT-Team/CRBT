const { logos, emojis, items, illustrations, links } = require("../../../index");
const bd = items.badges; const bn = items.banners

module.exports.command = {
    name: "store",
    aliases: ["shop"],
    description_enUS: "Brings the CRBT Store up.",
    usage_enUS: "<banners | badges (optional)>",
    module: "economy",
    code: `
$reactionCollector[$botLastMessageID;$authorID;1h;${emojis.store.badges},😎,${emojis.store.banners};badges,badges2,banners;yes]

$reply[$messageID;

$if[$message==]

{author:$get[title-$getGlobalUserVar[language]]:${logos.CRBTsmall}}
{description:$get[protip-$getGlobalUserVar[language]]}
{field:$get[purplets-$getGlobalUserVar[language]]:no}
{field:$get[familiarFaces-$getGlobalUserVar[language]]:
${bd.goodmeal.contents} ${bd.goodmeal.name}\n**${emojis.purplet} ${bd.goodmeal.value} Purplets**
\`$getServerVar[prefix]buy badge goodmeal\`
—
${bd.udu.contents} ${bd.udu.name}\n**${emojis.purplet} ${bd.udu.value} Purplets**
\`$getServerVar[prefix]buy badge udu\`
:yes}
{field:$get[flags-$getGlobalUserVar[language]]:
${bd.france.contents} ${bd.france.name}\n**${emojis.purplet} ${bd.france.value} Purplets**
\`$getServerVar[prefix]buy badge france\`
—
${bd.usa.contents} ${bd.usa.name}\n**${emojis.purplet} ${bd.usa.value} Purplets**
\`$getServerVar[prefix]buy badge usa\`
—
${bd.russia.contents} ${bd.russia.name}\n**${emojis.purplet} ${bd.russia.value} Purplets**
\`$getServerVar[prefix]buy badge russia\`
—
${bd.brazil.contents} ${bd.brazil.name}\n**${emojis.purplet} ${bd.brazil.value} Purplets**
\`$getServerVar[prefix]buy badge brazil\`
—
${bd.poland.contents} ${bd.poland.name}\n**${emojis.purplet} ${bd.poland.value} Purplets**
\`$getServerVar[prefix]buy badge poland\`
:yes}
{field:$get[jobs-$getGlobalUserVar[language]]:
${bd.developer.contents} ${bd.developer.name}\n**${emojis.purplet} ${bd.developer.value} Purplets**
\`$getServerVar[prefix]buy badge developer\`
—
${bd.doctor.contents} ${bd.doctor.name}\n**${emojis.purplet} ${bd.doctor.value} Purplets**
\`$getServerVar[prefix]buy badge doctor\`
—
${bd.musician.contents} ${bd.musician.name}\n**${emojis.purplet} ${bd.musician.value} Purplets**
\`$getServerVar[prefix]buy badge musician\`
—
${bd.illustrator.contents} ${bd.illustrator.name}\n**${emojis.purplet} ${bd.illustrator.value} Purplets**
\`$getServerVar[prefix]buy badge illustrator\`
:yes}
{thumbnail:${illustrations.badges}}

$let[title-enUS;CRBT Store - Badges (Page 1)]

$elseIf[$toLowercase[$message]==badges]

{author:$get[title-$getGlobalUserVar[language]]:${logos.CRBTsmall}}
{description:$get[protip-$getGlobalUserVar[language]]}
{field:$get[purplets-$getGlobalUserVar[language]]:no}
{field:$get[familiarFaces-$getGlobalUserVar[language]]:
${bd.goodmeal.contents} ${bd.goodmeal.name}\n**${emojis.purplet} ${bd.goodmeal.value} Purplets**
\`$getServerVar[prefix]buy badge goodmeal\`
—
${bd.udu.contents} ${bd.udu.name}\n**${emojis.purplet} ${bd.udu.value} Purplets**
\`$getServerVar[prefix]buy badge udu\`
:yes}
{field:$get[flags-$getGlobalUserVar[language]]:
${bd.france.contents} ${bd.france.name}\n**${emojis.purplet} ${bd.france.value} Purplets**
\`$getServerVar[prefix]buy badge france\`
—
${bd.usa.contents} ${bd.usa.name}\n**${emojis.purplet} ${bd.usa.value} Purplets**
\`$getServerVar[prefix]buy badge usa\`
—
${bd.russia.contents} ${bd.russia.name}\n**${emojis.purplet} ${bd.russia.value} Purplets**
\`$getServerVar[prefix]buy badge russia\`
—
${bd.brazil.contents} ${bd.brazil.name}\n**${emojis.purplet} ${bd.brazil.value} Purplets**
\`$getServerVar[prefix]buy badge brazil\`
—
${bd.poland.contents} ${bd.poland.name}\n**${emojis.purplet} ${bd.poland.value} Purplets**
\`$getServerVar[prefix]buy badge poland\`
:yes}
{field:$get[jobs-$getGlobalUserVar[language]]:
${bd.developer.contents} ${bd.developer.name}\n**${emojis.purplet} ${bd.developer.value} Purplets**
\`$getServerVar[prefix]buy badge developer\`
—
${bd.doctor.contents} ${bd.doctor.name}\n**${emojis.purplet} ${bd.doctor.value} Purplets**
\`$getServerVar[prefix]buy badge doctor\`
—
${bd.musician.contents} ${bd.musician.name}\n**${emojis.purplet} ${bd.musician.value} Purplets**
\`$getServerVar[prefix]buy badge musician\`
—
${bd.illustrator.contents} ${bd.illustrator.name}\n**${emojis.purplet} ${bd.illustrator.value} Purplets**
\`$getServerVar[prefix]buy badge illustrator\`
:yes}
{thumbnail:${illustrations.badges}}

$let[title-enUS;CRBT Store - Badges (Page 1)]

$endelseIf
$elseIf[$toLowercase[$message]==banners]

{author:$get[title-$getGlobalUserVar[language]]:${logos.CRBTsmall}}
{description:$get[preview-$getGlobalUserVar[language]]}
{field:$get[purplets-$getGlobalUserVar[language]]:no}
{field:$get[season3-$getGlobalUserVar[language]]:
**• [${bn.flower.name}]($get[baseURL]/${bn.flower.contents})**\n**${emojis.purplet} ${bn.flower.value} Purplets**
\`$getServerVar[prefix]buy banner flower\`
—
**• [${bn.cake.name}]($get[baseURL]/${bn.cake.contents})**\n**${emojis.purplet} ${bn.cake.value} Purplets**
\`$getServerVar[prefix]buy banner cake\`
—
**• [${bn.mountain.name}]($get[baseURL]/${bn.mountain.contents})**\n**${emojis.purplet} ${bn.mountain.value} Purplets**
\`$getServerVar[prefix]buy banner mountain\`
—
**• [${bn.stripes.name}]($get[baseURL]/${bn.stripes.contents})**\n**${emojis.purplet} ${bn.stripes.value} Purplets**
\`$getServerVar[prefix]buy banner stripes\`
:yes}
{field:—:
**• [${bn.blood.name}]($get[baseURL]/${bn.blood.contents})**\n**${emojis.purplet} ${bn.blood.value} Purplets**
\`$getServerVar[prefix]buy banner blood\`
—
**• [${bn.space.name}]($get[baseURL]/${bn.space.contents})**\n**${emojis.purplet} ${bn.space.value} Purplets**
\`$getServerVar[prefix]buy banner space\`
—
**• [${bn.bubbles.name}]($get[baseURL]/${bn.bubbles.contents})**\n**${emojis.purplet} ${bn.bubbles.value} Purplets**
\`$getServerVar[prefix]buy banner bubbles\`
:yes}
{thumbnail:${illustrations.banners}}

$let[title-enUS;CRBT Store - Banners]

$endelseIf
$else
    $loop[1;args]
$endif

{color:$getGlobalUserVar[color]}
;no]

$let[purplets-enUS;Balance:${emojis.purplet} $getGlobalUserVar[user_bank] Purplets]
$let[preview-enUS;Preview any banner on your profile using the \`$getServerVar[prefix]preview <banner name>\` command!]
$let[protip-enUS;You can get info on any item using the \`$getServerVar[prefix]iteminfo <item name>\` command!]
$let[familiarFaces-enUS;Familiar faces]
$let[flags-enUS;Flags]
$let[jobs-enUS;Jobs]
$let[emotions-enUS;Emotions]
$let[season3-enUS;Season 3 banners]
$let[baseURL;${links.banners}3]

$argsCheck[<1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}