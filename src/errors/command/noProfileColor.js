const { colors, emojis, links } = require("../../../index");

module.exports.awaitedCommand = {
    name: "noProfileColor",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} You don't have a profile color!]
$let[description-enUS;To change your Discord profile color, go to your user settings and click the color picker under "Profile Color". From then you can run the command again to use it as your CRBT accent color!
Otherwize you can just see all of the available default CRBT colors with \`$getServerVar[prefix]color\`.]
    `}