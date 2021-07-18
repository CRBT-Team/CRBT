const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "onProfile",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} $randomText[Mmmmh...;Ohhhh;An wild error appeared!]]
$let[description-enUS;$replaceText[$replaceText[$checkCondition[$getGlobalUserVar[lastCmd]==removebanner];false;This $replaceText[$replaceText[$getGlobalUserVar[lastCmd];remove;];use;] is $replaceText[$replaceText[$checkContains[$getGlobalUserVar[lastCmd];remove];true;not];false;already] on your profile!];true;You don't have a profile banner!]]
    `}