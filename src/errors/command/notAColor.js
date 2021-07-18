const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "notAColor",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} Something weird happened]
$let[description-enUS;You need to enter a [valid hexadecimal color](https://htmlcolorcodes.com/color-picker/) or one of the few color names available (check with \`$getServerVar[prefix]color\`).]
    `}