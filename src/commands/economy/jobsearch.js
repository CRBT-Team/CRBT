const { items } = require('../../..');

module.exports.command = {
    name: "jobsearch",
    aliases: ["job-search", "job_search", "j-search", "jsearch"],
    description_enUS: "Gives you three randomly selected jobs, as well as descriptions for each. Note that this selection will not re-shuffle unless you get a job.",
    module: "economy",
    code: `
$reply[$messageID;
{author:$userTag - Job Search:$authorAvatar}
{description:
These are three randomly selected jobs for you.
Note that this selection will not re-shuffle unless you get a job.
Pick any one you like (or hate the least ${items.badges.udu.contents}) to start your journey into the CRBT economy!
}
{field:$get[job1]:
$get[$get[random1]-description]
\`$getServerVar[prefix]jobapply $toLowercase[$get[job1]]\`
:yes}
{field:$get[job2]:
$get[$get[random2]-description]
\`$getServerVar[prefix]jobapply $toLowercase[$get[job2]]\`
:yes}
{field:$get[job3]:
$get[$get[random3]-description]
\`$getServerVar[prefix]jobapply $toLowercase[$get[job3]]\`
:yes}
{color:$getGlobalUserVar[color]}
;no]

$if[$getGlobalUserVar[job_propositions]==]

    $setGlobalUserVar[job_propositions; $get[random1] $get[random2] $get[random3] ]

    $let[job3;$replaceText[$replaceText[$replaceText[$toLocaleUppercase[$get[random3]];Mcdoemployee;Fast food employee];Youtuber;Videomaker];Policeman;Police officer]]
    $let[job2;$replaceText[$replaceText[$replaceText[$toLocaleUppercase[$get[random2]];Mcdoemployee;Fast food employee];Youtuber;Videomaker];Policeman;Police officer]]
    $let[job1;$replaceText[$replaceText[$replaceText[$toLocaleUppercase[$get[random1]];Mcdoemployee;Fast food employee];Youtuber;Videomaker];Policeman;Police officer]]

    $let[random3;$randomText[$joinSplitText[;]]]
    $textSplit[$get[pool3];|]
    $let[pool3;$replaceText[$get[pool2];$replaceText[$replaceText[$checkCondition[$get[random2]==policeman];true;|$get[random2]];false;$get[random2]|];]]
    $let[random2;$randomText[$joinSplitText[;]]]
    $textSplit[$get[pool2];|]
    $let[pool2;$replaceText[$get[pool1];$replaceText[$replaceText[$checkCondition[$get[random1]==policeman];true;|$get[random1]];false;$get[random1]|];]]
    $let[random1;$randomText[$joinSplitText[;]]]
    $textSplit[$get[pool1];|]
    $let[pool1;farmer|cashier|musician|youtuber|mcdoemployee|pornstar|gardener|prostitute|developer|doctor|illustrator|policeman]

$else

    $let[job3;$replaceText[$replaceText[$replaceText[$toLocaleUppercase[$get[random3]];Mcdoemployee;Fast food employee];Youtuber;Videomaker];Policeman;Police officer]]
    $let[job2;$replaceText[$replaceText[$replaceText[$toLocaleUppercase[$get[random2]];Mcdoemployee;Fast food employee];Youtuber;Videomaker];Policeman;Police officer]]
    $let[job1;$replaceText[$replaceText[$replaceText[$toLocaleUppercase[$get[random1]];Mcdoemployee;Fast food employee];Youtuber;Videomaker];Policeman;Police officer]]

    $let[random3;$splitText[3]]
    $let[random2;$splitText[2]]
    $let[random1;$splitText[1]]

    $textSplit[$replaceText[$replaceText[1 $getGlobalUserVar[job_propositions] 2;1  ;];  2;]; ]

$endif

$let[farmer-description;Harvest in fruit and vegetables and grow as farm master!

**Salary:**\nVery Low to High
**Cooldown:**\nLow to Very High]

$let[cashier-description;Scan these barcodes and nail your way to become the ultimate cashier!

**Salary:**\nMidly Low to Midly High
**Cooldown:**\nVery Low to Midly High]

$let[youtuber-description;Work your way to become to best videomaker in town!

**Salary:**\nVery Low to Very High
**Cooldown:**\nMedium to High]

$let[mcdoemployee-description;Sell those chicken nuggets and earn your way to be a fast food expert.

**Salary:**\nMidly Low to medium
**Cooldown:**\nMedium to Low]

$let[musician-description;Write, compose and sing your songs to get popular.

**Salary:**\nVery Low to Very High
**Cooldown:**\nMedium to Very High]

$let[illustrator-description;Sell your art to the world and explore the wonders with your brush!

**Salary:**\nVery Low to Midly High
**Cooldown:**\nMedium (stable)]

$let[developer-description;Use your skills to create cool projects and become a renown developer!

**Salary:**\nVery Low to Midly High
**Cooldown:**\nVery Low to High]

$let[doctor-description;Cure your patients, test them and give them health advice.

**Salary:**\nMidly High to Very High
**Cooldown:**\nHigh to Super High]

$let[policeman-description;Let security and justice guide your journey to become a well-known policeman/woman!

**Salary:**\nMidly High to High
**Cooldown:**\nHigh to Very High]

$let[pornstar-description;Film adult videos and performances to satisfy your viewers

**Salary:**\nHigh to Very High
**Cooldown:**\nVery High to Super High]

$let[prostitute-description;Use your body and skill to satisfy your customers (or not)!

**Salary:**\nVery variable
**Cooldown:**\nMedium to Midly High]

$let[gardener-description;Cut those bushes and moe those lawns to get to be a wonderful gardener

**Salary:**\nMidly Low to Midly High
**Cooldown:**\nMedium to Low]

$onlyIf[$getGlobalUserVar[job_type]==$getVar[job_type];{execute:alreadyHaveJob}]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
    `}