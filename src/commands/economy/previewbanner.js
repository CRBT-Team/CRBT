const { links, items } = require("../../../index");
const badges = items.badges;

module.exports.command = {
    name: "preview",
    aliases: ["previewbanner", "banner-preview"],
    module: "economy",
    usage_enUS: "<banner name (e.g. banner sweet, banner blue)>",
    description_enUS: "Shows your profile with a chosen banner without having to buy it.",
    code: `
    $reply[$messageID;
    {author:$get[title-$getGlobalUserVar[language]]}
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

    $let[title-enUS;Previewing banner $replaceText[$toLowercase[$message];banner ;]]
    $let[badges-enUS;Badges ($get[e])]
    $let[pronouns-enUS;Pronouns:$get[profilePronouns]]

    $let[j;$replaceText[$replaceText[$checkCondition[$get[e]>5];false;yes];true;no]]
    $let[e;$math[$replaceText[$replaceText[$checkContains[$getGlobalUserVar[profile_badges;$get[id]];badge];false;0];true;$charCount[$replaceText[$replaceText[$findSpecialChars[$getGlobalUserVar[profile_badges;$get[id]]]; ;];>;]]]/12]]

$let[profilePronouns;$replaceText[$toLocaleUppercase[$getGlobalUserVar[profilePronouns;$get[id]]]; ;/]]
$let[profileBadges;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$getGlobalUserVar[profile_badges;$get[id]];<;];>;];badge france;${badges.france.contents}];badge udu;${badges.udu.contents}];badge russian;${badges.russia.contents}];badge russia;${badges.russia.contents}];badge french;${badges.france.contents}];badge usa;${badges.usa.contents}];badge brazil;${badges.brazil.contents}];badge poland;${badges.poland.contents}];badge goodmeal;${badges.goodmeal.contents}];badge dollidot;${badges.dollidot.contents}];badge developer;${badges.developer.contents}];badge partner ;];badge purplet;${badges.purplet.contents}];badge dave;${badges.dave.contents}];badge doctor;${badges.doctor.contents}];badge musician;${badges.musician.contents}];badge illustrator;${badges.illustrator.contents}];badge flushed;${badges.flushed.contents}];badge joy;${badges.joy.contents}];badge smile;${badges.smile.contents}];badge thinking;${badges.thinking.contents}];badge winktongue;${badges.winktongue.contents}];badge starstruck;${badges.starstruck.contents}];badge pensive;${badges.pensive.contents}];badge wink;${badges.wink.contents}]]

$let[profileName;$replaceText[$replaceText[$replaceText[$replaceText[$getGlobalUserVar[profile_name;$get[id]];<user.name>;$username[$get[id]]];<user.id>;$get[id]];<user.tag>;$userTag[$get[id]]];<var.purplets>;$getGlobalUserVar[user_bank;$get[id]]]]
$let[profileBio;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$get[bio];<user.name>;$username[$get[id]]];<user.id>;$get[id]];<user.tag>;$userTag[$get[id]]];<var.purplets>;$getGlobalUserVar[user_bank;$get[id]]];<user.status>;$replaceText[$replaceText[$getCustomStatus[$authorID;emoji];none;] $getCustomStatus[$authorID;state]; none;None]]]
$let[bio;$replaceText[$getGlobalUserVar[profile_about;$get[id]];none;$get[noBio-$getGlobalUserVar[language]]]

$let[noBio-enUS;$replaceText[$replaceText[$checkCondition[$get[id]==$authorID];true;You don't have a bio! You can change that with \`$getServerVar[prefix]setbio\`.];false;This user doesn't have a bio]

$let[banner;${links.banners}$getObjectProperty[banners.$get[a].season]/$getObjectProperty[banners.$get[a].contents]]

$onlyIf[$getObjectProperty[banners.$get[a]]!=;{execute:unknownItem}]

$let[a;$replaceText[$replaceText[$toLowercase[$message];banner;]; ;]]

$djsEval[const { items, links } = require("../../../../../index");
d.object.banners = items.banners;]

$let[id;$authorID]

$argsCheck[>1;{execute:args}]

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}
/*
$createObject[{"a": "$toLocaleUppercase[$replaceText[$replaceText[$toLowercase[$message];banner;]; ;]]"}]
*/