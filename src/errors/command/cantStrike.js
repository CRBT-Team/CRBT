const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "cantStrike",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}
{footer:$get[footer-$getGlobalUserVar[language]]}
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.general.error} You can't $getGlobalUserVar[lastCmd] $replaceText[$replaceText[$get[id];$authorID;yourself];$ownerID;the server's owner]!]
$let[footer-enUS;$replaceText[$replaceText[$checkCondition[$get[id]==$authorID];true;I mean, technically you could.... but why?];false;]]

$let[id;$replaceText[$replaceText[$replaceText[$message[1];<@!;];<@;];>;]]
    `}