const { colors, emojis, links } = require("../../../index");

module.exports.awaitedCommand = {
    name: "userNoBanner",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} You Got Banner'd!]
$let[description-enUS;$replaceText[$replaceText[$checkCondition[$findUser[$message]==$authorID];true;You don't];false;This user doesn't] have a Discord profile banner. Learn more about Discord profile banners **[here](https://support.discord.com/hc/en-us/articles/4403147417623-Custom-Profiles)**.\nNote: This is not the same banner as your CRBT Profile banner. To fetch a user's CRBT Profile banner (assuming they have one), use \`$getServerVar[prefix]profile <user>\`.]
    `}