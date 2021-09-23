const { emojis, colors, links } = require("../../../index");

module.exports.awaitedCommand = {
    name: "nsfwDisabled",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}
{description:$get[description-$getGlobalUserVar[language]]}
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} No more horny!]
$let[description-enUS;Sorry to say this, but CRBT's NSFW commands have been removed since the September 2021 release.
If you'd want them back, feel free to \`$getServerVar[prefix]suggest\` them back or join our **[support server](${links.discord})**.]
    `}