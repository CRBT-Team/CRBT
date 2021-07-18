const { logos, emojis, items, illustrations, links } = require("../../../index");
const badges = items.badges; const banners = items.banners

module.exports.awaitedCommand = {
    name: "badges2",
    code: `
$editMessage[$message[1];
{author:$get[title-$getGlobalUserVar[language]]:${logos.CRBTsmall}}
{field:$get[purplets-$getGlobalUserVar[language]]:no}
{field:$get[emotions-$getGlobalUserVar[language]]:
${badges.flushed.contents} ${badges.flushed.name}\n**${emojis.purplet} ${badges.flushed.value} Purplets**
\`$getServerVar[prefix]buy badge flushed\`
—
${badges.joy.contents} ${badges.joy.name}\n**${emojis.purplet} ${badges.joy.value} Purplets**
\`$getServerVar[prefix]buy badge joy\`
—
${badges.smile.contents} ${badges.smile.name}\n**${emojis.purplet} ${badges.smile.value} Purplets**
\`$getServerVar[prefix]buy badge smile\`
—
${badges.thinking.contents} ${badges.thinking.name}\n**${emojis.purplet} ${badges.thinking.value} Purplets**
\`$getServerVar[prefix]buy badge thinking\`
:yes}
{field:—:
${badges.winktongue.contents} ${badges.winktongue.name}\n**${emojis.purplet} ${badges.winktongue.value} Purplets**
\`$getServerVar[prefix]buy badge winktongue\`
—
${badges.starstruck.contents} ${badges.starstruck.name}\n**${emojis.purplet} ${badges.starstruck.value} Purplets**
\`$getServerVar[prefix]buy badge starstruck\`
—
${badges.pensive.contents} ${badges.pensive.name}\n**${emojis.purplet} ${badges.pensive.value} Purplets**
\`$getServerVar[prefix]buy badge pensive\`
—
${badges.wink.contents} ${badges.wink.name}\n**${emojis.purplet} ${badges.wink.value} Purplets**
\`$getServerVar[prefix]buy badge wink\`
:yes}
{thumbnail:${illustrations.badges}}
{color:$getGlobalUserVar[color]}
;$channelID]


$let[title-enUS;CRBT Store - Badges (Page 2)]
$let[purplets-enUS;Balance:${emojis.purplet} $getGlobalUserVar[user_bank] Purplets]
$let[familiarFaces-enUS;Familiar faces]
$let[flags-enUS;Flags]
$let[jobs-enUS;Jobs]
$let[emotions-enUS;Emotions]
    `}