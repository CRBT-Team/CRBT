const { logos, emojis, items, illustrations, links } = require("../../../index");
const badges = items.badges; const banners = items.banners

module.exports.awaitedCommand = {
    name: "banners",
    code: `
$editMessage[$message[1];
{author:$get[title-$getGlobalUserVar[language]]:${logos.CRBTsmall}}
{description:$get[description-$getGlobalUserVar[language]]}
{field:$get[purplets-$getGlobalUserVar[language]]:no}
{field:$get[season3-$getGlobalUserVar[language]]:
**• [${banners.flower.name}]($get[baseURL]/${banners.flower.contents})**\n**${emojis.purplet} ${banners.flower.value} Purplets**
\`$getServerVar[prefix]buy banner flower\`
—
**• [${banners.cake.name}]($get[baseURL]/${banners.cake.contents})**\n**${emojis.purplet} ${banners.cake.value} Purplets**
\`$getServerVar[prefix]buy banner cake\`
—
**• [${banners.mountain.name}]($get[baseURL]/${banners.mountain.contents})**\n**${emojis.purplet} ${banners.mountain.value} Purplets**
\`$getServerVar[prefix]buy banner mountain\`
—
**• [${banners.stripes.name}]($get[baseURL]/${banners.stripes.contents})**\n**${emojis.purplet} ${banners.stripes.value} Purplets**
\`$getServerVar[prefix]buy banner stripes\`
:yes}
{field:—:
**• [${banners.blood.name}]($get[baseURL]/${banners.blood.contents})**\n**${emojis.purplet} ${banners.blood.value} Purplets**
\`$getServerVar[prefix]buy banner blood\`
—
**• [${banners.space.name}]($get[baseURL]/${banners.space.contents})**\n**${emojis.purplet} ${banners.space.value} Purplets**
\`$getServerVar[prefix]buy banner space\`
—
**• [${banners.bubbles.name}]($get[baseURL]/${banners.bubbles.contents})**\n**${emojis.purplet} ${banners.bubbles.value} Purplets**
\`$getServerVar[prefix]buy banner bubbles\`
:yes}
{thumbnail:${illustrations.banners}}
{color:$getGlobalUserVar[color]}
;$channelID]


$let[title-enUS;CRBT Store - Banners]
$let[purplets-enUS;Balance:${emojis.purplet} $getGlobalUserVar[user_bank] Purplets]
$let[preview-enUS;Preview any banner on your profile using the \`$getServerVar[prefix]preview <banner name>\` command!]
$let[familiarFaces-enUS;Familiar faces]
$let[flags-enUS;Flags]
$let[jobs-enUS;Jobs]
$let[emotions-enUS;Emotions]
$let[season3-enUS;Season 3 banners]
$let[baseURL;${links.banners}3]
    `}