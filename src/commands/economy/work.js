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
{title:${emojis.general.success} You worked as a $get[jobname]...}

{description:
$get[rwt_$getGlobalUserVar[job_type]] ${emojis.general.purplet} $getObjectProperty[earnings] Purplets! 
You earned $get[randomXP] Job XP (You just advanced to level $math[$getGlobalUserVar[job_level]+1]!).
You lost ${emojis.general.purplet} $random[0;$getObjectProperty[maxloses]] Purplets in the way!
}

{color:${colors.success}}
;no]

$elseIf[$getGlobalUserVar[job_level]==4]

$setGlobalUserVar[user_bank;$math[$getGlobalUserVar[user_bank]+$getObjectProperty[earnings]-$random[0;$getObjectProperty[maxloses]]]]

$reply[$messageID;
{title:${emojis.general.success} You worked as a $get[jobname]...}

{description:
$get[rwt_$getGlobalUserVar[job_type]] ${emojis.general.purplet} $getObjectProperty[earnings] Purplets! 
You lost ${emojis.general.purplet} $random[0;$getObjectProperty[maxloses]] Purplets in the way!
}

{color:${colors.success}}
;no]

$endelseIf
$else

$setGlobalUserVar[user_bank;$math[$getGlobalUserVar[user_bank]+$getObjectProperty[earnings]-$random[0;$getObjectProperty[maxloses]]]]

$setGlobalUserVar[job_xp;$math[$getGlobalUserVar[job_xp]+$get[randomXP]]]

$reply[$messageID;
{title:${emojis.general.success} You worked as a $get[jobname]...}

{description:
$get[rwt_$getGlobalUserVar[job_type]] ${emojis.general.purplet} $getObjectProperty[earnings] Purplets! 
You earned $get[randomXP] Job XP ($math[$getGlobalUserVar[job_req]-$getGlobalUserVar[job_xp]-$get[randomXP]] remaining to level $math[$getGlobalUserVar[job_level]+1]).
You lost ${emojis.general.purplet} $random[0;$getObjectProperty[maxloses]] Purplets in the way!
}

{color:${colors.success}}
;no]

$endif

$let[rwt_farmer;$randomText[You harvested a couple of melons and earned;You sold 20 carrots and got;You sold two pounds of turnips worth;You sold a bag of patatoes for;You harvested, then sold two watermelons for;You sold two of your cows to another farmer and got;You farmed potatoes and tomatoes to make a very funny joke that no one understand but one person, who was kind enough to land you;You farm all day alone to get;You ride a TRAAAACTOOOOR on your farm and get]]

$let[rwt_cashier;$randomText[Someone gave you a tip of;You did your job well and the boss gives you;You put all your heart and soul scanning these barcodes and you earned;You recommend someone they buy extra, and they did! You get;You sit on the chair all day at your desk, watching people, waiting for customers to arrive, and boringly enough you earn;]]

$let[rwt_youtuber;$randomText[You made an epic *ForNight* funnies compilation and got;Someone posted a drama about you! You replied in a sponsored apology video which earned you;You uploaded a movie illegally onto YouTube flooded with ads that make you earn;You posted some funny memes, some random guy gave you;Your *Soup Malio* gameplay got kinda popular to the point where you get;Your latest video got shared a lot, and that reflects on your earnings! You earned;You uploaded a gaming video on YouTube and managed to get 60k views and;You made a very clickbaity video and got;You make a *Red: Shaduh Legandz* sponsorship that got you;The famous and rich YouTuber *MistaBest* made a video about you and you earned;You are chatting with your viewers on stream as a Vtuber and all simps donate you]]

$let[rwt_mcdoemployee;$randomText[You sold a piece of paper on a rock to a blind man. He enjoys his broken teeth and you enjoy your tip of;You sold 50 cheeseburgers! Yum, you got;Your new menu idea was a success! Your boss enjoys it and congrats you with]]

$let[rwt_musician;$randomText[You played that very sick theme everyone likes, and you got tipped;You wrote a very cool song for a big artist, their corporation gives you]]

$let[rwt_illustrator;$randomText[You animated a fanfiction and earned;You drew an epic fanart for some big content creator! They feature you on their socials and pay you;You made a really cool piece of art that some rich people buys for]]

$let[rwt_developer;$randomText[You rewrote the whole Python language in C++, everyone's minds are blown up and you get;You find a bug on CRBT and decide to report it. As a congratulation, you earned;The boss gets mad looking at your spaghetti code! Luckily, an opponent sitting right next to you had much better code so you steal it and earn;You design a much much better bot than CRBT... wait that's impossible, right???? Anyway, you earn]]

$let[rwt_doctor;$randomText[You pull out a heart out of a human mannequin and earned;You managed to fake someone's death to "revive" them, nobody noticed the trickery and are very impressed! You get;You found a cure to this popular disease going on, and you earn;You make a sick guy eat a rock because you thought it would be funny, but turns out he somewhat got cured. So strangely enough you earn]]

$let[rwt_policeman;$randomText[You and the boys catch a drug dealer on the street! You get;You find a dead body and report it. Its discovery makes you gain]]

$let[rwt_pornstar;$randomText[You farted during the recording! Everyone laughed and your video got a lot of engagement and;You do very naughty things and you get;Your very naughty livestream got a lot of simps engaged that donated]]

$let[rwt_prostitute;$randomText[You stay all the night on the street, but not in vain. Your friend picks you up in their car and you robbed from them;You did your job really well and everyone beings to hear about you. You get]]

$let[rwt_gardener;$randomText[You cut some bushes for a friend that pays you;You mowed the lawn of the neighbors and earned]]

$let[4req;4800]
$let[3req;2400]
$let[2req;800]
$let[1req;0]
$let[randomXP;$random[100;200]]

$let[jobname;$replaceText[$replaceText[$replaceText[$getGlobalUserVar[job_type];mcdoemployee;McDonald's employee];youtuber;YouTuber];policeman;police officer]]


$globalCooldown[$getObjectProperty[cooldown]m;{execute:cooldown}]

$djsEval[const { jobs } = require("../../../../../index");
d.object.earnings = jobs["$getObjectProperty[job]"]["$getObjectProperty[level]"].earnings
d.object.cooldown = jobs["$getObjectProperty[job]"]["$getObjectProperty[level]"].cooldown
d.object.maxloses = jobs["$getObjectProperty[job]"].maxloses]

$createObject[{"job":"$getGlobalUserVar[job_type]", "level":"level$getGlobalUserVar[job_level]"}]

$onlyIf[$getGlobalUserVar[job_type]!=$getVar[job_type];{execute:noJob}]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
`}