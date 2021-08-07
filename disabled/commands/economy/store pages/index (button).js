const { logos, emojis, items, illustrations, links } = require("../../../index");
const badges = items.badges; const banners = items.banners

module.exports.interactionCommand = {
    name: "index",
    prototype: "button",
    code: `
$interactionReply[;

{author:$get[title-$getGlobalUserVar[language]]:${logos.CRBTsmall}}

{field:$get[purplets-$getGlobalUserVar[language]]:no}

{description:
debug: $getMessageVar[temp1] $messageID $message
**${emojis.store.badges} Badges**
Emojis you can add up to your profile.
**${emojis.store.banners} Banners**
A unique image you can have on your profile. 
}

{color:$getGlobalUserVar[color]};

{actionRow:$get[badges]:$get[banners]}
;$replaceText[$replaceText[$get[cond];false;64];true;];$replaceText[$replaceText[$get[cond];false;4];true;7]]
$let[cond;$checkCondition[$getUserVar[temp1;$clientID]==$authorID]]

$let[title-enUS;CRBT Store - Home]

$let[banners;Banners,2,1,banners,$get[emoji3],false]
$let[emoji3;$replaceText[$replaceText[$replaceText[${emojis.store.banners};<:;];>;];:;|]|false]

$let[badges;Badges,2,1,badges,$get[emoji1],false]
$let[emoji1;$replaceText[$replaceText[$replaceText[${emojis.store.badges};<:;];>;];:;|]|false]

$let[purplets-enUS;Balance:${emojis.purplet} **$getGlobalUserVar[user_bank] Purplets**]
$let[preview-enUS;Preview any banner on your profile using the \`$getServerVar[prefix]preview <banner name>\` command!]
$let[protip-enUS;You can get info on any item using the \`$getServerVar[prefix]iteminfo <item name>\`]
    `}