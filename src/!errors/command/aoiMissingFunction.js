const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "aoiMissingFunction",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{footer:$get[footer-$getGlobalUserVar[language]]}
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} Couldn't find this Aoi.js function...]
$let[description-enUS;...although you can still try to search through Aoi.js' documentation, right [here](https://aoi.leref.ga).]
    `}