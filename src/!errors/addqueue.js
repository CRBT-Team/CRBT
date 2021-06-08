const { links, emojis, colors } = require("../../index");

module.exports.awaitedCommand = {
    name: "addQueue",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.red}}
;no]

$let[title-enUS;${emojis.general.error} An error occured while adding \`$message\` to the queue!]
$let[description-enUS;This may happen because:
- You are being rate limited.
- The video you're trying to play is age restricted.
- The given URL is invalid.
Try again by checking these parameters and check the [Support server](${links.info.discord})]
    `}