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
{field:$get[cooldowns-$getGlobalUserVar[language]]:no}
{field:$get[level-$getGlobalUserVar[language]]:yes}
{field:$get[xp-$getGlobalUserVar[language]]:yes}

{color:$getGlobalUserVar[color;$get[id]]}
;no]


$let[title-enUS;$userTag[$get[id]] - Job info]
$let[balance-enUS;Balance:${emojis.general.purplet} **$getGlobalUserVar[user_bank;$get[id]] Purplets**]
$let[cooldowns-enUS;Cooldowns:\`$getServerVar[prefix]hourly\`#COLON# $replaceText[$replaceText[$checkCondition[$getCooldownTime[1h;globalUser;hourly;$get[id]]==0];true;**Available!**];false;$getCooldownTime[1h;globalUser;hourly;$get[id]]\n\`$getServerVar[prefix]work\`#COLON# $replaceText[$replaceText[$checkCondition[$getCooldownTime[1h;globalUser;work;$get[id]]==0];true;**Available!**];false;$getCooldownTime[1h;globalUser;work;$get[id]]]]
$let[job-enUS;Job:$replaceText[$replaceText[$toLocaleUppercase[$getGlobalUserVar[job_type;$get[id]]];Mcdoemployee;McDonald's employee];Youtuber;YouTuber]]
$let[level-enUS;Level:$replaceText[$getGlobalUserVar[job_level;$get[id]]/4;4/4;**MAX**]]

$let[xp-enUS;XP:$replaceText[$replaceText[$checkCondition[$getGlobalUserVar
[job_level;$get[id]]==4];true;**MAX**];false;$getGlobalUserVar[job_xp;$get[id]]/$getGlobalUserVar[job_req;$get[id]]]]

$if[$message==]
    $let[id;$authorID]
$else
    $let[id;$findUser[$message]]
    $onlyIf[$findUser[$message]!=undefined;{execute:usernotfound}]
$endif

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
    `}