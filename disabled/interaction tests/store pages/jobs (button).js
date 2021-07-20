const { logos, emojis, items, illustrations, links } = require("../../../index");
const badges = items.badges; const banners = items.banners

module.exports.interactionCommand = {
    name: "jobs",
    prototype: "button",
    code: `
$interactionReply[;

{author:$get[title-$getGlobalUserVar[language]]:${logos.CRBTsmall}}

{title:Jobs}

{field:$replaceText[${badges.flushed.contents};:;#COLON#] ${badges.flushed.name}:
**${emojis.purplet} ${badges.flushed.value} Purplets**
\`$getServerVar[prefix]buy badge flushed\`
:yes}
{field:$replaceText[${badges.joy.contents};:;#COLON#] ${badges.joy.name}:
**${emojis.purplet} ${badges.joy.value} Purplets**
\`$getServerVar[prefix]buy badge joy\`
:yes}
{field:$replaceText[${badges.smile.contents};:;#COLON#] ${badges.smile.name}:
**${emojis.purplet} ${badges.smile.value} Purplets**
\`$getServerVar[prefix]buy badge smile\`
:yes}
{field:$replaceText[${badges.thinking.contents};:;#COLON#] ${badges.thinking.name}:
**${emojis.purplet} ${badges.thinking.value} Purplets**
\`$getServerVar[prefix]buy badge thinking\`
:yes}
{field:$replaceText[${badges.winktongue.contents};:;#COLON#] ${badges.winktongue.name}:
**${emojis.purplet} ${badges.winktongue.value} Purplets**
\`$getServerVar[prefix]buy badge winktongue\`
:yes}
{field:$replaceText[${badges.starstruck.contents};:;#COLON#] ${badges.starstruck.name}:
**${emojis.purplet} ${badges.starstruck.value} Purplets**
\`$getServerVar[prefix]buy badge starstruck\`
:yes}
{field:$replaceText[${badges.pensive.contents};:;#COLON#] ${badges.pensive.name}:
**${emojis.purplet} ${badges.pensive.value} Purplets**
\`$getServerVar[prefix]buy badge pensive\`
:yes}
{field:$replaceText[${badges.wink.contents};:;#COLON#] ${badges.wink.name}:
**${emojis.purplet} ${badges.wink.value} Purplets**
\`$getServerVar[prefix]buy badge wink\`
:yes}

{field:$get[purplets-$getGlobalUserVar[language]]:no}

{thumbnail:${illustrations.badges}}

{footer:Pro tip∶ $get[protip-$getGlobalUserVar[language]]}

{color:$getGlobalUserVar[color]};

{actionRow:$get[back]:$get[prev]:$get[next]}
;;7]

$let[title-enUS;CRBT Store - Badges (Page 4/4)]

$let[next;,2,1,jobs,next|867080274194071582|false,true]

$let[prev;,2,1,emotions,previous|867080071637106699|false,false]

$let[back;Back,2,2,index,$get[emoji1],false]
$let[emoji1;previous|867080071637106699|false]

$let[purplets-enUS;Balance:${emojis.purplet} **$getGlobalUserVar[user_bank] Purplets**]
$let[preview-enUS;Preview any banner on your profile using the $getServerVar[prefix]preview <banner name> command!]
$let[protip-enUS;You can get info on any item using the $getServerVar[prefix]iteminfo <item name> command.]
    `}