const { colors, emojis, links } = require("../../../index");
const langs = require("../../../data/misc/languageShortCodes.json");

module.exports.awaitedCommand = {
    name: "translateLang",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} ¿Hablas inglés?]
$let[description-enUS;You need to use one of these languages for the target or the source language:
\`\`\`
$replaceText[$replaceText[${Object.values(langs).join(', ')};${langs["zh-CN"]};${langs["zh-CN"]} (zh-CN)];${langs["zh-TW"]};${langs["zh-TW"]} (zh-TW)]
\`\`\`]
    `}