const { logos, emojis, items, illustrations, links } = require("../../../index");
const badges = items.badges; const banners = items.banners

module.exports.interactionCommand = {
    name: "flags",
    prototype: "button",
    code: `
$interactionReply[;

{author:$get[title-$getGlobalUserVar[language]]:${logos.CRBTsmall}}

{title:Country flags}

{field:$replaceText[${badges.france.contents};:;#COLON#] ${badges.france.name}:
**${emojis.purplet} ${badges.france.value} Purplets**
\`$getServerVar[prefix]buy badge france\`
:yes}
{field:$replaceText[${badges.usa.contents};:;#COLON#] ${badges.usa.name}:
**${emojis.purplet} ${badges.usa.value} Purplets**
\`$getServerVar[prefix]buy badge usa\`
:yes}
{field:$replaceText[${badges.russia.contents};:;#COLON#] ${badges.russia.name}:
**${emojis.purplet} ${badges.russia.value} Purplets**
\`$getServerVar[prefix]buy badge russia\`
:yes}
{field:$replaceText[${badges.brazil.contents};:;#COLON#] ${badges.brazil.name}:
**${emojis.purplet} ${badges.brazil.value} Purplets**
\`$getServerVar[prefix]buy badge brazil\`
:yes}
{field:$replaceText[${badges.poland.contents};:;#COLON#] ${badges.poland.name}:
**${emojis.purplet} ${badges.poland.value} Purplets**
\`$getServerVar[prefix]buy badge poland\`
:yes}

{field:$get[purplets-$getGlobalUserVar[language]]:no}

{thumbnail:${illustrations.badges}}

{footer:Pro tip∶ $get[protip-$getGlobalUserVar[language]]}

{color:$getGlobalUserVar[color]};

{actionRow:$get[back]:$get[prev]:$get[next]}
;$replaceText[$replaceText[$get[cond];false;64];true;];$replaceText[$replaceText[$get[cond];false;4];true;7]]
$let[cond;$checkCondition[$getUserVar[temp1;$clientID]==$authorID]]

$let[title-enUS;CRBT Store - Badges (Page 2/4)]

$let[next;,2,1,emotions,next|867080274194071582|false,false]

$let[prev;,2,1,badges,previous|867080071637106699|false,false]

$let[back;Back,2,2,index,$get[emoji1],false]
$let[emoji1;previous|867080071637106699|false]

$let[purplets-enUS;Balance:${emojis.purplet} **$getGlobalUserVar[user_bank] Purplets**]
$let[preview-enUS;Preview any banner on your profile using the $getServerVar[prefix]preview <banner name> command!]
$let[protip-enUS;You can get info on any item using the $getServerVar[prefix]iteminfo <item name> command.]
    `}