const { links, items } = require("../../index");
const badges = items.badges;

module.exports.command = {
    name: "profile",
    aliases: ['userprofile', 'up','uspro', 'user_profile', 'user-profile'],
    module: "economy",
    usage_enUS: "<user ID | username | @mention (optional)>",
    description_enUS: "Retrieves your CRBT profile (badges, bio, banner, etc...), or a specified user's (if any).",
    code: `
    $reply[$messageID;
    {title:$get[profileName]}
    {description:$get[profileBio]}
    
    {field:$get[badges-$getGlobalUserVar[language]]:
    $replaceText[$replaceText[$checkContains[$getGlobalUserVar[profile_badges;$get[id]];badge];false;None];true;$get[profileBadges]]‎‎
    :yes}

    {field:$get[pronouns-$getGlobalUserVar[language]]:$get[j]}
    
    {image:$get[banner]}
    {thumbnail:$userAvatar[$get[id];512]}
    {color:$getGlobalUserVar[color;$get[id]]}
    ;no]

    $let[badges-enUS;Badges ($get[e])]
    $let[pronouns-enUS;Pronouns:$get[profilePronouns]]

    $let[j;$replaceText[$replaceText[$checkCondition[$get[e]>5];false;yes];true;no]]
    $let[e;$math[$replaceText[$replaceText[$checkContains[$getGlobalUserVar[profile_badges;$get[id]];badge];false;0];true;$charCount[$replaceText[$replaceText[$findSpecialChars[$getGlobalUserVar[profile_badges;$get[id]]]; ;];>;]]]/12]]

$let[profilePronouns;$replaceText[$toLocaleUppercase[$getGlobalUserVar[profilePronouns;$get[id]]]; ;/]]
$let[profileBadges;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$getGlobalUserVar[profile_badges;$get[id]];<badge ;];>;];udu;${badges.udu.contents}];russian;${badges.russia.contents}];french;${badges.france.contents}];usa;${badges.usa.contents}];brazil;${badges.brazil.contents}];poland;${badges.poland.contents}];goodmeal;${badges.goodmeal.contents}];dollidot;${badges.dollidot.contents}];developer;${badges.developer.contents}];partner;${badges.partner.contents}];purplet;${badges.purplet.contents}];dave;${badges.dave.contents}];doctor;${badges.doctor.contents}];musician;${badges.musician.contents}];illustrator;${badges.illustrator.contents}];flushed;${badges.flushed.contents}];joy;${badges.joy.contents}];smile;${badges.smile.contents}];thinking;${badges.thinking.contents}];winktongue;${badges.winktongue.contents}];starstruck;${badges.starstruck.contents}];pensive;${badges.pensive.contents}];wink;${badges.wink.contents}]]

$let[profileName;$replaceText[$replaceText[$replaceText[$replaceText[$getGlobalUserVar[profile_name;$get[id]];<username>;$username[$get[id]]];<userid>;$get[id]];<usertag>;$userTag[$get[id]]];<purplets>;$getGlobalUserVar[user_bank;$get[id]]]]
$let[profileBio;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$get[bio];<username>;$username[$get[id]]];<userid>;$get[id]];<usertag>;$userTag[$get[id]]];<purplets>;$getGlobalUserVar[user_bank;$get[id]]];<userstatus>;$replaceText[$replaceText[$getCustomStatus[$authorID;emoji];none;] $getCustomStatus[$authorID;state]; none;None]]]
$let[bio;$replaceText[$getGlobalUserVar[profile_about;$get[id]];none;$get[noBio-$getGlobalUserVar[language]]]

$let[noBio-enUS;$replaceText[$replaceText[$checkCondition[$get[id]==$authorID];true;You don't have a bio! You can change that with \`$getServerVar[prefix]setbio\`.];false;This user doesn't have a bio]

$let[banner;${links.banners}$getObjectProperty[banners.$get[a].season]/$getObjectProperty[banners.$get[a].contents]]

$djsEval[const { items, links } = require("../../../../../index");
d.object.banners = items.banners;]

$let[a;$replaceText[$replaceText[$getGlobalUserVar[profile_banner;$get[id]];<banner ;];>;]]

$if[$message==]
    $let[id;$authorID]
$else
    $let[id;$findUser[$message]]
    $onlyIf[$findUser[$message;no]!=undefined;{execute:usernotfound}]
$endif

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=]$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]$endif
$setGlobalUserVar[lastCmd;$commandName]
    `}

/*
$let[pronouns2-enUS;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$get[pronouns];hh;he/him];hi;he/it];hs;he/she];ht;he/they];ih;it/him];ii;it/its];is;it/she];it;it/they];shh;she/he];sh;she/her];si;she/it];st;she/they];th;they/he];ti;they/it];ts;they/she];tt;they/them];any;Any pronouns];other;Other pronouns];ask;Ask];avoid;Avoid pronouns, use my name];none;Unspecified];unspecified;unspecified]]


$let[filteredName;‎$filterMessageWords[$get[profileName];no;$joinSplitText[;]]]
$let[filteredBio;‎$filterMessageWords[$get[profileBio];no;$joinSplitText[;]]]
$textSplit[$replaceText[${bad.blockedWords};,;$get[key]];$get[key]]
$let[key;$randomString[10]]
*/