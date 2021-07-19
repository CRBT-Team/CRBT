const { colors, emojis, links } = require("../../../index");

module.exports.awaitedCommand = {
    name: "limitReached",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} Oh already?!]
$let[description-enUS;You've reached the limit of $replaceText[$replaceText[$checkContains[$getGlobalUserVar[lastCmd];emoji];true;$get[maxEmojis] emojis];false;$get[maxRoles] roles].]

$let[maxRoles;250]
$let[maxEmojis;$replaceText[$replaceText[$replaceText[$replaceText[$serverBoostLevel;0;50];1;100];2;150];3;250]]
    `}