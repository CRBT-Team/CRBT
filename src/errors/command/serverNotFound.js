const { colors, emojis, links } = require("../../../index");

module.exports.awaitedCommand = {
    name: "serverNotFound",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} Couldn't find this server.]
$let[description-enUS;I couldn't fetch information for this Discord server as I am not part of it, or the ID used is invalid.\nTo invite me to $replaceText[$replaceText[$checkCondition[$channelType==dm];true;any];false;another] server, click [here](${links.info.discord}).]
    `}