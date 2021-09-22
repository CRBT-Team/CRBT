const { links, items } = require("../../../index");
const badges = items.badges;

module.exports.command = {
    name: "profile",
    aliases: ['userprofile', 'up','uspro', 'user_profile', 'user-profile'],
    module: "economy",
    usage_enUS: "<user ID | username | @mention (optional)>",
    description_enUS: "Retrieves your CRBT profile (badges, bio, banner, etc...), or a specified user's (if any).",
    code: `
    $reply[$messageID;
    {title:
    $replaceText[$replaceText[$checkCondition[$charCount[$get[profileName]]>40];true;$cropText[$get[profileName];40]...];false;$get[profileName]]
    }
    {description:
    $replaceText[$replaceText[$checkCondition[$charCount[$get[profileBio]]>120];true;$cropText[$get[profileBio];120]...];false;$get[profileBio]]
    }
    
    {field:$get[badges-$getGlobalUserVar[language]]:
    $replaceText[$replaceText[$checkCondition[$get[e]==0];true;None];false;$get[profileBadges]]‎‎
    :yes}

    {field:$get[pronouns-$getGlobalUserVar[language]]:$get[j]}
    
    {image:$get[banner]}
    {thumbnail:$userAvatar[$get[id];512]}
    {color:$getGlobalUserVar[color;$get[id]]}
    ;no]

    $let[badges-enUS;Badges ($get[e])]
    $let[pronouns-enUS;Pronouns:$replaceText[$get[profilePronouns];Username;Use my username]]

    $let[j;$replaceText[$replaceText[$checkCondition[$get[e]>5];false;yes];true;no]]
    $let[e;$math[$getTextSplitLength-1]]

$textSplit[$get[profileBadges]; ;]

$let[profilePronouns;$replaceText[$toLocaleUppercase[$getGlobalUserVar[profilePronouns;$get[id]]]; ;/]]
$let[profileBadges;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$getGlobalUserVar[profile_badges;$get[id]];<;];>;];badge france;${badges.france.contents}];badge udu;${badges.udu.contents}];badge russian;${badges.russia.contents}];badge russia;${badges.russia.contents}];badge french;${badges.france.contents}];badge usa;${badges.usa.contents}];badge brazil;${badges.brazil.contents}];badge poland;${badges.poland.contents}];badge goodmeal;${badges.goodmeal.contents}];badge dollidot;${badges.dollidot.contents}];badge developer;${badges.developer.contents}];badge partner ;];badge purplet;${badges.purplet.contents}];badge dave;${badges.dave.contents}];badge doctor;${badges.doctor.contents}];badge musician;${badges.musician.contents}];badge illustrator;${badges.illustrator.contents}];badge flushed;${badges.flushed.contents}];badge joy;${badges.joy.contents}];badge smile;${badges.smile.contents}];badge thinking;${badges.thinking.contents}];badge winktongue;${badges.winktongue.contents}];badge starstruck;${badges.starstruck.contents}];badge pensive;${badges.pensive.contents}];badge wink;${badges.wink.contents}]]

$let[profileName;$replaceText[$replaceText[$replaceText[$replaceText[$getGlobalUserVar[profile_name;$get[id]];<user.name>;$username[$get[id]]];<user.id>;$get[id]];<user.tag>;$userTag[$get[id]]];<var.purplets>;$getGlobalUserVar[user_bank;$get[id]]]]
$let[profileBio;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$get[bio];<user.name>;$username[$get[id]]];<user.id>;$get[id]];<user.tag>;$userTag[$get[id]]];<var.purplets>;$getGlobalUserVar[user_bank;$get[id]]];<user.status>;$replaceText[$replaceText[$getCustomStatus[$get[id];emoji];none;] $getCustomStatus[$get[id];state]; none;None]]]
$let[bio;$replaceText[$getGlobalUserVar[profile_about;$get[id]];none;$get[noBio-$getGlobalUserVar[language]]]

$let[noBio-enUS;$replaceText[$replaceText[$checkCondition[$get[id]==$authorID];true;You don't have a bio! You can change that with \`$getServerVar[prefix]setbio\`.];false;This user doesn't have a bio]

$let[banner;${links.banners}$getObjectProperty[banners.$get[a].season]/$getObjectProperty[banners.$get[a].contents]]

$djsEval[const { items, links } = require("../../../../../index");
d.object.banners = items.banners;]

$let[a;$replaceText[$replaceText[$getGlobalUserVar[profile_banner;$get[id]];<banner ;];>;]]

$if[$message==]
    $let[id;$authorID]
$else
    $onlyIf[$getGlobalUserVar[blocklisted;$get[id]]==false;{execute:userBlocklisted}]
    $let[id;$findUser[$message]]
    $onlyIf[$findUser[$message;no]!=undefined;{execute:usernotfound}]
$endif

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}

/*
$let[pronouns2-enUS;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$get[pronouns];hh;he/him];hi;he/it];hs;he/she];ht;he/they];ih;it/him];ii;it/its];is;it/she];it;it/they];shh;she/he];sh;she/her];si;she/it];st;she/they];th;they/he];ti;they/it];ts;they/she];tt;they/them];any;Any pronouns];other;Other pronouns];ask;Ask];avoid;Avoid pronouns, use my name];none;Unspecified];unspecified;unspecified]]


$let[filteredName;‎$filterMessageWords[$get[profileName];no;$joinSplitText[;]]]
$let[filteredBio;‎$filterMessageWords[$get[profileBio];no;$joinSplitText[;]]]
$textSplit[$replaceText[${bad.blockedWords};,;$get[key]];$get[key]]
$let[key;$randomString[10]]
*/