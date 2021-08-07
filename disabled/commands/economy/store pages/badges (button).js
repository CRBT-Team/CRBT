const { logos, emojis, items, illustrations, links } = require("../../../../index");
const badges = items.badges; const banners = items.banners

module.exports.interactionCommand = {
    name: "badges",
    prototype: "button",
    code: `
$interactionReply[;

{author:$get[title-$getGlobalUserVar[language]]:${logos.CRBTsmall}}

{title:Familiar faces}

{description:
debug: $getMessageVar[temp1] $messageID $message}

{field:$replaceText[${badges.goodmeal.contents};:;#COLON#] ${badges.goodmeal.name}:
**${emojis.purplet} ${badges.goodmeal.value} Purplets**
\`$getServerVar[prefix]buy badge goodmeal\`
:yes}
{field:$replaceText[${badges.udu.contents};:;#COLON#] ${badges.udu.name}:
**${emojis.purplet} ${badges.udu.value} Purplets**
\`$getServerVar[prefix]buy badge udu\`
:yes}

{field:$get[purplets-$getGlobalUserVar[language]]:no}

{footer:Pro tip∶ $get[protip-$getGlobalUserVar[language]]}

{thumbnail:${illustrations.badges}}

{color:$getGlobalUserVar[color]};

{actionRow:$get[back]:$get[prev]:$get[next]}
;$replaceText[$replaceText[$get[cond];false;64];true;];$replaceText[$replaceText[$get[cond];false;4];true;7]]
$let[cond;$checkCondition[$getUserVar[temp1;$clientID]==$authorID]]

$let[title-enUS;CRBT Store - Badges (Page 1/4)]

$let[next;,2,1,flags,next|867080274194071582|false,false]

$let[prev;,2,1,badges,previous|867080071637106699|false,true]

$let[back;Back,2,2,index,$get[emoji1],false]
$let[emoji1;previous|867080071637106699|false]

$let[purplets-enUS;Balance:${emojis.purplet} **$getGlobalUserVar[user_bank] Purplets**]
$let[preview-enUS;Preview any banner on your profile using the $getServerVar[prefix]preview <banner name> command!]
$let[protip-enUS;You can get info on any item using the $getServerVar[prefix]iteminfo <item name> command.]
    `}