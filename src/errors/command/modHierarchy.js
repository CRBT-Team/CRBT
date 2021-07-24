const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "modHierarchy",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}
{footer:$get[footer-$getGlobalUserVar[language]]}
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} $get[cond]]

$let[cond;$replaceText[
$replaceText[$replaceText[
$checkCondition[$rolePosition[$highestRole[$get[id]]]>$rolePosition[$highestRole[$clientID]]]
;false;I can't $getGlobalUserVar[lastCmd] users above me or on the same height in the role hierarchy.]
;true;
$replaceText[$replaceText[
$checkCondition[$rolePosition[$highestRole[$get[id]]]!=$rolePosition[$highestRole[$authorID]]]
;false;You can't $getGlobalUserVar[lastCmd] users with the same highest role.]
;true;
$replaceText[$replaceText[
$checkCondition[$rolePosition[$highestRole[$get[id]]]>=$rolePosition[$highestRole[$authorID]]]
;false;You can't $getGlobalUserVar[lastCmd] users above you in the role hierarchy.]
;true;what]]];\n;]]

$let[id;$replaceText[$replaceText[$replaceText[$message[1];<@!;];<@;];>;]]
    `}