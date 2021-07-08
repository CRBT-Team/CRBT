const { emojis, colors } = require("../../../index");

module.exports.command = {
    name: "jobapply",
    code: `
$setGlobalUserVar[job_type;$get[message]]

$reply[$messageID;
{title:${emojis.general.success} You will now work as a $replaceText[$replaceText[$replaceText[$get[message];mcdoemployee;fast food employee];youtuber;videast];policeman;police officer]!}
{description:You can now use \`$getServerVar[prefix]work\`}
{color:${colors.success}}
;no]

$onlyIf[$checkContains[$getGlobalUserVar[job_propositions];$get[message]]==true;not in the selection!!!!!!!!!!!!!!!!!!!!!!!!]

$let[message;$replaceText[$replaceText[$replaceText[$replaceText[$toLowercase[$message]; ;];fastfoodemployee;mcdoemployee];videast;youtuber];policeofficer;policeman]]
    `}