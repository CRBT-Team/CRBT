const { emojis, colors, illustrations } = require("../../../index");

module.exports.awaitedCommand = {
    name: "prefixCancel",
    code: `
$setGlobalUserVar[lastCmd;prefix]

$editMessage[$splitText[3];
{title:$get[title-$getGlobalUserVar[language]]}
{description:$get[description-$getGlobalUserVar[language]]}
{color:${colors.error}}
;$channelID]

$let[title-enUS;${emojis.error} Prefix change automatically cancelled]
$let[description-enUS;Due to inactivity on the confirmation prompt, the prefix couldn't be changed.]

$textSplit[$getGlobalUserVar[lastCmd]; ** ]

    `}