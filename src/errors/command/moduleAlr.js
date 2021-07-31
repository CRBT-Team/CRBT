const { colors, emojis } = require("../../../index");

module.exports.awaitedCommand = {
    name: "moduleAlr",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]} 
{description:$get[description-$getGlobalUserVar[language]]} 
{color:${colors.error}}
;no]

$let[title-enUS;${emojis.error} Worry not, this is already done!]
$let[description-enUS;The \`$get[module2]\` module is already $replaceText[$replaceText[$get[cond];true;enabled];false;disabled].]

$let[cond;$checkContains[$stringStartsWith[$toLowercase[$message];+]$stringStartsWith[$toLowercase[$message];enable ]$stringStartsWith[$toLowercase[$message];add ];true]]

$let[module2;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$get[module1];basic;misc];economy&profiles;economy];profiles;economy];messagelogs;messageLogs];modlogs;modLogs];autopublish;autoPublish]]
$let[module1;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$toLowercase[$message];-;]; ;];remove;];-;];disable;];enable;];+;];add;]]
    `}