const { logos, emojis, items, illustrations, links } = require("../../../index");
const badges = items.badges; const banners = items.banners

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
{field:$get[purplets-$getGlobalUserVar[language]]:no}
{field:$get[familiarFaces-$getGlobalUserVar[language]]:
${badges.goodmeal.contents} ${badges.goodmeal.name}\n**${emojis.general.purplet} ${badges.goodmeal.value} Purplets**
\`$getServerVar[prefix]buy badge goodmeal\`
—
${badges.udu.contents} ${badges.udu.name}\n**${emojis.general.purplet} ${badges.udu.value} Purplets**
\`$getServerVar[prefix]buy badge udu\`
:yes}
{field:$get[flags-$getGlobalUserVar[language]]:
${badges.france.contents} ${badges.france.name}\n**${emojis.general.purplet} ${badges.france.value} Purplets**
\`$getServerVar[prefix]buy badge france\`
—
${badges.usa.contents} ${badges.usa.name}\n**${emojis.general.purplet} ${badges.usa.value} Purplets**
\`$getServerVar[prefix]buy badge usa\`
—
${badges.russia.contents} ${badges.russia.name}\n**${emojis.general.purplet} ${badges.russia.value} Purplets**
\`$getServerVar[prefix]buy badge russia\`
—
${badges.brazil.contents} ${badges.brazil.name}\n**${emojis.general.purplet} ${badges.brazil.value} Purplets**
\`$getServerVar[prefix]buy badge brazil\`
:yes}
{field:$get[jobs-$getGlobalUserVar[language]]:
${badges.developer.contents} ${badges.developer.name}\n**${emojis.general.purplet} ${badges.developer.value} Purplets**
\`$getServerVar[prefix]buy badge developer\`
—
${badges.doctor.contents} ${badges.doctor.name}\n**${emojis.general.purplet} ${badges.doctor.value} Purplets**
\`$getServerVar[prefix]buy badge doctor\`
—
${badges.musician.contents} ${badges.musician.name}\n**${emojis.general.purplet} ${badges.musician.value} Purplets**
\`$getServerVar[prefix]buy badge musician\`
—
${badges.illustrator.contents} ${badges.illustrator.name}\n**${emojis.general.purplet} ${badges.illustrator.value} Purplets**
\`$getServerVar[prefix]buy badge illustrator\`
:yes}
{thumbnail:${illustrations.badges}}

$let[title-enUS;CRBT Store - Badges (Page 1)]

$elseIf[$toLowercase[$message]==badges]

{author:$get[title-$getGlobalUserVar[language]]:${logos.CRBTsmall}}
{field:$get[purplets-$getGlobalUserVar[language]]:no}
{field:$get[familiarFaces-$getGlobalUserVar[language]]:
${badges.goodmeal.contents} ${badges.goodmeal.name}\n**${emojis.general.purplet} ${badges.goodmeal.value} Purplets**
\`$getServerVar[prefix]buy badge goodmeal\`
—
${badges.udu.contents} ${badges.udu.name}\n**${emojis.general.purplet} ${badges.udu.value} Purplets**
\`$getServerVar[prefix]buy badge udu\`
:yes}
{field:$get[flags-$getGlobalUserVar[language]]:
${badges.france.contents} ${badges.france.name}\n**${emojis.general.purplet} ${badges.france.value} Purplets**
\`$getServerVar[prefix]buy badge france\`
—
${badges.usa.contents} ${badges.usa.name}\n**${emojis.general.purplet} ${badges.usa.value} Purplets**
\`$getServerVar[prefix]buy badge usa\`
—
${badges.russia.contents} ${badges.russia.name}\n**${emojis.general.purplet} ${badges.russia.value} Purplets**
\`$getServerVar[prefix]buy badge russia\`
—
${badges.brazil.contents} ${badges.brazil.name}\n**${emojis.general.purplet} ${badges.brazil.value} Purplets**
\`$getServerVar[prefix]buy badge brazil\`
:yes}
{field:$get[jobs-$getGlobalUserVar[language]]:
${badges.developer.contents} ${badges.developer.name}\n**${emojis.general.purplet} ${badges.developer.value} Purplets**
\`$getServerVar[prefix]buy badge developer\`
—
${badges.doctor.contents} ${badges.doctor.name}\n**${emojis.general.purplet} ${badges.doctor.value} Purplets**
\`$getServerVar[prefix]buy badge doctor\`
—
${badges.musician.contents} ${badges.musician.name}\n**${emojis.general.purplet} ${badges.musician.value} Purplets**
\`$getServerVar[prefix]buy badge musician\`
—
${badges.illustrator.contents} ${badges.illustrator.name}\n**${emojis.general.purplet} ${badges.illustrator.value} Purplets**
\`$getServerVar[prefix]buy badge illustrator\`
:yes}
{thumbnail:${illustrations.badges}}

$let[title-enUS;CRBT Store - Badges (Page 1)]

$endelseIf
$elseIf[$toLowercase[$message]==banners]

{author:$get[title-$getGlobalUserVar[language]]:${logos.CRBTsmall}}
{description:$get[description-$getGlobalUserVar[language]]}
{field:$get[purplets-$getGlobalUserVar[language]]:no}
{field:$get[season3-$getGlobalUserVar[language]]:
**• [${banners.flower.name}]($get[baseURL]/${banners.flower.contents})**\n**${emojis.general.purplet} ${banners.flower.value} Purplets**
\`$getServerVar[prefix]buy banner flower\`
—
**• [${banners.cake.name}]($get[baseURL]/${banners.cake.contents})**\n**${emojis.general.purplet} ${banners.cake.value} Purplets**
\`$getServerVar[prefix]buy banner cake\`
—
**• [${banners.mountain.name}]($get[baseURL]/${banners.mountain.contents})**\n**${emojis.general.purplet} ${banners.mountain.value} Purplets**
\`$getServerVar[prefix]buy banner mountain\`
—
**• [${banners.stripes.name}]($get[baseURL]/${banners.stripes.contents})**\n**${emojis.general.purplet} ${banners.stripes.value} Purplets**
\`$getServerVar[prefix]buy banner stripes\`
:yes}
{field:—:
**• [${banners.blood.name}]($get[baseURL]/${banners.blood.contents})**\n**${emojis.general.purplet} ${banners.blood.value} Purplets**
\`$getServerVar[prefix]buy banner blood\`
—
**• [${banners.space.name}]($get[baseURL]/${banners.space.contents})**\n**${emojis.general.purplet} ${banners.space.value} Purplets**
\`$getServerVar[prefix]buy banner space\`
—
**• [${banners.bubbles.name}]($get[baseURL]/${banners.bubbles.contents})**\n**${emojis.general.purplet} ${banners.bubbles.value} Purplets**
\`$getServerVar[prefix]buy banner bubbles\`
:yes}
{thumbnail:${illustrations.banners}}

$let[title-enUS;CRBT Store - Banners]

$endelseIf
$endif

{color:$getGlobalUserVar[color]}
;no]

$let[purplets-enUS;Balance:${emojis.general.purplet} $getGlobalUserVar[user_bank] Purplets]
$let[preview-enUS;Preview any banner on your profile using the \`$getServerVar[prefix]preview <banner name>\` command!]
$let[familiarFaces-enUS;Familiar faces]
$let[flags-enUS;Flags]
$let[jobs-enUS;Jobs]
$let[emotions-enUS;Emotions]
$let[season3-enUS;Season 3 banners]
$let[baseURL;${links.banners}3]

$argsCheck[<1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
    `}