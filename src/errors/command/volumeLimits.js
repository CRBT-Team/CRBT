const { colors, emojis, links } = require("../../../index");

module.exports.awaitedCommand = {
    name: "volumeLimits",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} Woa woa too $replaceText[$replaceText[$checkCondition[$message<0];true;low!];false;high!]]
$let[description-enUS;You cannot set the volume higher than 100% or lower than 0%.]
    `}