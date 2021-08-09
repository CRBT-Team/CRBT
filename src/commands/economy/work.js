const { emojis, colors } = require("../../../index");

module.exports.command = {
    name: "work",
    module: "economy",
    aliases: ["w"],
    description_enUS: "Earn some Purplets and job XP.",
    cooldown: "Will depend on your job!",
    code: `
$if[$checkCondition[$math[$getGlobalUserVar[job_xp]+$random[200;500]]>$getGlobalUserVar[job_req]]$checkCondition[$getGlobalUserVar[job_level]<4]==truetrue]

$setGlobalUserVar[job_level;$sum[$getGlobalUserVar[job_level];1]]

$setGlobalUserVar[job_req;$replaceText[$replaceText[$replaceText[$getGlobalUserVar[job_level];1;$get[3req]];2;$get[4req]];3;]]

$setGlobalUserVar[user_bank;$math[$getGlobalUserVar[user_bank]+$getObjectProperty[earnings]-$random[0;$getObjectProperty[maxloses]]]]

$setGlobalUserVar[job_xp;$sum[$getGlobalUserVar[job_xp];$get[randomXP]]]

$reply[$messageID;
{title:${emojis.success} You worked as a $get[jobname]}

{description:
$replaceText[$get[rwt];{purplets};**${emojis.purplet} $getObjectProperty[earnings] Purplets.**]
You earned $get[randomXP] Job XP (You just advanced to level $math[$getGlobalUserVar[job_level]+1]!).
You lost **${emojis.purplet} $random[0;$getObjectProperty[maxloses]] Purplets** in the way...
}

{color:${colors.success}}
;no]

$elseIf[$getGlobalUserVar[job_level]==4]

$setGlobalUserVar[user_bank;$math[$getGlobalUserVar[user_bank]+$getObjectProperty[earnings]-$random[0;$getObjectProperty[maxloses]]]]

$reply[$messageID;
{title:${emojis.success} You worked as a $get[jobname]}

{description:
$replaceText[$get[rwt];{purplets};**${emojis.purplet} $getObjectProperty[earnings] Purplets.**] 
You lost **${emojis.purplet} $random[0;$getObjectProperty[maxloses]] Purplets** in the way...
}

{color:${colors.success}}
;no]

$endelseIf
$else

$setGlobalUserVar[user_bank;$math[$getGlobalUserVar[user_bank]+$getObjectProperty[earnings]-$random[0;$getObjectProperty[maxloses]]]]

$setGlobalUserVar[job_xp;$math[$getGlobalUserVar[job_xp]+$get[randomXP]]]

$reply[$messageID;
{title:${emojis.success} You worked as a $get[jobname]}

{description:
$replaceText[$get[rwt];{purplets};**${emojis.purplet} $getObjectProperty[earnings] Purplets.**]
You earned $get[randomXP] Job XP ($math[$getGlobalUserVar[job_req]-$getGlobalUserVar[job_xp]-$get[randomXP]] remaining to level $math[$getGlobalUserVar[job_level]+1]).
You lost **${emojis.purplet} $random[0;$getObjectProperty[maxloses]] Purplets** in the way...
}

{color:${colors.success}}
;no]

$endif

$let[rwt;$randomText[$joinSplitText[;]]]

$textSplit[$getObjectProperty[rwt];|]

$let[4req;4800]
$let[3req;2400]
$let[2req;800]
$let[1req;0]
$let[randomXP;$random[100;200]]

$let[jobname;$replaceText[$replaceText[$replaceText[$getGlobalUserVar[job_type];mcdoemployee;fast food employee];youtuber;videast];policeman;police officer]]


$globalCooldown[$getObjectProperty[cooldown]m;{execute:cooldown}]

$djsEval[const { jobs } = require("../../../../../index");
d.object.earnings = jobs["$getObjectProperty[job]"]["$getObjectProperty[level]"].earnings
d.object.cooldown = jobs["$getObjectProperty[job]"]["$getObjectProperty[level]"].cooldown
d.object.maxloses = jobs["$getObjectProperty[job]"].maxloses
d.object.rwt = jobs["$getObjectProperty[job]"].rwt]

$createObject[{"job":"$getGlobalUserVar[job_type]", "level":"level$getGlobalUserVar[job_level]"}]

$onlyIf[$getGlobalUserVar[job_type]!=$getVar[job_type];{execute:noJob}]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
`}