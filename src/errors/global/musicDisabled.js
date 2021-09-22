const { emojis, colors, links } = require("../../../index");

module.exports.awaitedCommand = {
    name: "musicDisabled",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}
{description:$get[description-$getGlobalUserVar[language]]}
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} CRBT Music has came to an end.]
$let[description-enUS;We're super duper sorry to announce this, but just like competing bots we are closing the music module. To learn more, visit our **[support server](${links.discord})**.]
    `}