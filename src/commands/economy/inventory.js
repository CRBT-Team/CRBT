const { emojis, links, items } = require("../../../index");
const badges = items.badges;

module.exports.command = {
    name: "inventory",
    aliases: ["inv", "items", "badges", "banners"],
    module: "economy",
    usage: "<user ID | username | @mention>",
    description_enUS: "Opens a user's banners & badges inventory, as well as some detailed information.",
    code: `
$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]:$userAVatar[$get[id]]}
{field:$get[balance-$getGlobalUserVar[language]]:no}
{field:$get[color$checkCondition[$get[id]==$authorID]-$getGlobalUserVar[language]]:no}
{field:$get[badges$checkCondition[$get[id]==$authorID]-$getGlobalUserVar[language]]:no}
{field:$get[banner$checkCondition[$get[id]==$authorID]-$getGlobalUserVar[language]]:no}
{field:$get[ownedBadges$checkCondition[$get[id]==$authorID]-$getGlobalUserVar[language]]:yes}
{field:$get[ownedBanners$checkCondition[$get[id]==$authorID]-$getGlobalUserVar[language]]:yes}

{color:$getGlobalUserVar[color;$get[id]]}
;no]

$let[title-enUS;$userTag[$get[id]] - Inventory]
$let[balance-enUS;Balance:${emojis.general.purplet} **$getGlobalUserVar[user_bank;$get[id]] Purplets**]
$let[colortrue-enUS;Current color: **#$getGlobalUserVar[color;$get[id]]** (Change it with \`$getServerVar[prefix]setcolor\`)]
$let[colorfalse-enUS;Current color: **#$getGlobalUserVar[color;$get[id]]**]
$let[bannertrue-enUS;Active banner: $replaceText[[$getObjectProperty[banners.$get[a].name]]($get[banner]) (Change your banner with \`$getServerVar[prefix]setbanner\`);[](${links.banners}/) (Change your banner with \`$getServerVar[prefix]setbanner\`);None (If you have a banner, you can use it with \`$getServerVar[prefix]setbanner\`)]]
$let[bannerfalse-enUS;Active banner: $replaceText[[$getObjectProperty[banners.$get[a].name]]($get[banner]);[](${links.banners}/);None]]
$let[badgestrue-enUS;Active badges ($get[e]): $replaceText[$replaceText[$checkContains[$getGlobalUserVar[profile_badges;$get[id]];badge];false;None];true;$get[profileBadges]]‎‎\n(\`$getServerVar[prefix]addbadge\`/\`$getServerVar[prefix]removebadge\`)]
$let[badgesfalse-enUS;Active badges ($get[e]): $replaceText[$replaceText[$checkContains[$getGlobalUserVar[profile_badges;$get[id]];badge];false;None];true;$get[profileBadges]]‎‎]
$let[ownedBadgestrue-enUS;Owned badges ($get[e2]/23): $replaceText[\`\`\`\n$replaceText[$replaceText[a $replaceText[$replaceText[$getGlobalUserVar[invbadge;$get[id]];french;france];russian;russia];a , ;];badge ;]\`\`\`;\`\`\`\na \`\`\`;Feels kinda empty in there... Why don't you browse the Store (\`$getServerVar[prefix]store badges\`) to find what you want!]]
$let[ownedBadgesfalse-enUS;Owned badges ($get[e2]/23): $replaceText[\`\`\`\n$replaceText[$replaceText[a $replaceText[$replaceText[$getGlobalUserVar[invbadge;$get[id]];french;france];russian;russia];a , ;];badge ;]\`\`\`;\`\`\`\na \`\`\`;None]]
$let[ownedBannerstrue-enUS;Owned banners ($get[e3]/24): $replaceText[\`\`\`\n$replaceText[$replaceText[a $getGlobalUserVar[invbanner;$get[id]];a , ;];banner ;]\`\`\`;\`\`\`\na \`\`\`;This side of your inventory has more dust than actual banners... You know, you can find some cool stuff in the Store (\`$getServerVar[prefix]store banners\`)!]
$let[ownedBannersfalse-enUS;Owned banners ($get[e3]/24): $replaceText[\`\`\`\n$replaceText[$replaceText[a $getGlobalUserVar[invbanner;$get[id]];a , ;];banner ;]\`\`\`;\`\`\`\na \`\`\`;None]]

$let[e3;$replaceText[$replaceText[$checkContains[$getGlobalUserVar[invbanner;$get[id]];banner];false;0];true;$charCount[$findSpecialChars[$replaceText[$replaceText[$getGlobalUserVar[invbanner;$get[id]]; ;];,;@]]]]]
$let[e2;$replaceText[$replaceText[$checkContains[$getGlobalUserVar[invbadge;$get[id]];badge];false;0];true;$charCount[$findSpecialChars[$replaceText[$replaceText[$getGlobalUserVar[invbadge;$get[id]]; ;];,;@]]]]]
$let[e;$math[$replaceText[$replaceText[$checkContains[$getGlobalUserVar[profile_badges;$get[id]];badge];false;0];true;$charCount[$replaceText[$replaceText[$findSpecialChars[$getGlobalUserVar[profile_badges;$get[id]]]; ;];>;]]]/12]]
$let[profileBadges;$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$getGlobalUserVar[profile_badges;$get[id]];<badge ;];>;];france;${badges.france.contents}];udu;${badges.udu.contents}];russian;${badges.russia.contents}];russia;${badges.russia.contents}];french;${badges.france.contents}];usa;${badges.usa.contents}];brazil;${badges.brazil.contents}];poland;${badges.poland.contents}];goodmeal;${badges.goodmeal.contents}];dollidot;${badges.dollidot.contents}];developer;${badges.developer.contents}];partner;${badges.partner.contents}];purplet;${badges.purplet.contents}];dave;${badges.dave.contents}];doctor;${badges.doctor.contents}];musician;${badges.musician.contents}];illustrator;${badges.illustrator.contents}];flushed;${badges.flushed.contents}];joy;${badges.joy.contents}];smile;${badges.smile.contents}];thinking;${badges.thinking.contents}];winktongue;${badges.winktongue.contents}];starstruck;${badges.starstruck.contents}];pensive;${badges.pensive.contents}];wink;${badges.wink.contents}]]

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