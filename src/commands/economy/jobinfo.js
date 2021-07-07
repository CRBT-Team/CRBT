const { emojis } = require("../../../index");

module.exports.command = {
    name: "jobinfo",
    aliases: ["job-info", "job_info", "j-info", "xp", "rank", "level", "job"],
    description_enUS: "",
    module: "economy",
    usage_enUS: "<user ID | username | @mention (optional)>",
    code: `
$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]:$userAvatar[$get[id]]}

{field:$get[balance-$getGlobalUserVar[language]]:no}
{field:$get[job-$getGlobalUserVar[language]]:no}
{field:$get[streak-$getGlobalUserVar[language]]:no}
$if[$message==]
{field:$get[cooldowns-$getGlobalUserVar[language]]:no}
$endif
{field:$get[level-$getGlobalUserVar[language]]:yes}
{field:$get[xp-$getGlobalUserVar[language]]:yes}

{color:$getGlobalUserVar[color;$get[id]]}
;no]


$let[title-enUS;$userTag[$get[id]] - Job info]
$let[balance-enUS;Balance:${emojis.general.purplet} **$getGlobalUserVar[user_bank;$get[id]] Purplets**]
$let[streak-enUS;Hourly streak:**$getGlobalUserVar[hourly_streak;$get[id]]/5** ($math[5-$getGlobalUserVar[hourly_streak;$get[id]]] streak$replaceText[$replaceText[$checkCondition[$math[5-$getGlobalUserVar[hourly_streak;$get[id]]]==1];true;];false;s] left for a bonus!)]
$let[cooldowns-enUS;Cooldowns:\`$getServerVar[prefix]hourly\`#COLON# $replaceText[$replaceText[$checkCondition[$get[hourcd]==0];true;**Available!**];false;$get[hourcd]]
\`$getServerVar[prefix]work\`#COLON# $replaceText[$replaceText[$checkCondition[$get[workcd]==0];true;**Available!**];false;$get[workcd]]]
$let[job-enUS;Job:$get[jobname]]
$let[level-enUS;Level:$replaceText[$getGlobalUserVar[job_level;$get[id]]/4;4/4;**MAX**]]

$let[jobname;$replaceText[$replaceText[$replaceText[$toLocaleUppercase[$getGlobalUserVar[job_type;$get[id]]];Mcdoemployee;McDonald's employee];Youtuber;YouTuber];Policeman;Police officer]]

$let[xp-enUS;XP:$replaceText[$replaceText[$checkCondition[$getGlobalUserVar
[job_level;$get[id]]==4];true;**MAX**];false;$getGlobalUserVar[job_xp;$get[id]]/$getGlobalUserVar[job_req;$get[id]]]]

$if[$message==]
$let[workcd;$getCooldownTime[$getObjectProperty[cooldown]m;globalUser;work;$get[id]]]
$let[hourcd;$getCooldownTime[1h;globalUser;hourly;$get[id]]]

$djsEval[const { jobs } = require("../../../../../index");
const tools = require("dbd.js-utils");
d.object.cooldown = jobs["$getObjectProperty[job]"]["$getObjectProperty[level]"].cooldown]
$createObject[{"job":"$getGlobalUserVar[job_type;$get[id]]", "level":"level$getGlobalUserVar[job_level;$get[id]]"}]
$endif

$if[$message==]
    $let[id;$authorID]
$else
    $let[id;$findUser[$message]]
    $onlyIf[$findUser[$message]!=undefined;{execute:usernotfound}]
$endif

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}