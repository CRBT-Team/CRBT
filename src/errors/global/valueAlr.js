const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "valueAlr",
    code: `
$reply[$messageID;
{title:$get[$getGlobalUserVar[lastCmd]-1-$getGlobalUserVar[language]]} 
{description:$get[$getGlobalUserVar[lastCmd]-2-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[experiments-1-enUS;${emojis.error} EXperimental features are already $replaceText[$replaceText[$getGlobalUserVar[experimentalFeatures];true;enabled];false;disabled] for you.]
$let[experiments-2-enUS;]
    `}