const { emojis, colors } = require("../../../index");

module.exports.command = {
    name: "jobapply",
    aliases: ["job-apply", "job_apply", "j-apply", "japply"],
    description_enUS: "Makes you apply to a job, if it was in the Job Search propositions (\`<prefix>jobsearch\`).",
    module: "economy",
    usage_enUS: "<job name>",
    code: `
$setGlobalUserVar[job_type;$get[message]]
$deleteGlobalUserVar[job_propositions]

$reply[$messageID;
{title:${emojis.success} You will now work as a $replaceText[$replaceText[$replaceText[$get[message];mcdoemployee;fast food employee];youtuber;videast];policeman;police officer]!}
{description:You can now use \`$getServerVar[prefix]work\` to earn some Purplets and Job XP, and \`$getServerVar[prefix]jobinfo\` to get your current stats and info.
To leave your job at any moment, use \`$getServerVar[prefix]jobquit\`.}
{color:${colors.success}}
;no]

$onlyIf[$checkContains[$getGlobalUserVar[job_propositions]; $get[message] ]==true;{execute:notProposed}]

$let[message;$replaceText[$replaceText[$replaceText[$replaceText[$toLowercase[$message]; ;];fastfoodemployee;mcdoemployee];videast;youtuber];policeofficer;policeman]]

$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$getGlobalUserVar[experimentalFeatures]==true;{execute:experimentalFeatures}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
    `}