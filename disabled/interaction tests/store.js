const { logos, emojis, items, illustrations, links, colors } = require("../../index");
const badges = items.badges; const banners = items.banners

module.exports.command = {
    name: "store",
    aliases: ["shop"],
    description_enUS: "Displays the CRBT Store menu.",
    usage_enUS: "<banners | badges (optional)>",
    module: "economy",
    code: `
$setMessageVar[temp1;hello;$get[id]]

$editMessage[$get[id];
{author:$get[title-$getGlobalUserVar[language]]:${logos.CRBTsmall}}

{description:
**${emojis.store.badges} Badges**
Emojis you can add up to your profile.
**${emojis.store.banners} Banners**
A unique image you can have on your profile. 

$if[$channelType==dm]
You will need to type \`$getServerVar[prefix]store\` and the category of your choice, as interactions are disabled in DMs.
$endif
}

{field:$get[purplets-$getGlobalUserVar[language]]:no}

{color:$getGlobalUserVar[color]}
;$channelID]

$let[id;$botLastMessageID]

$apiMessage[;
{title:Loading CRBT Store...}
{color:${colors.orange}}
;

$if[$channelType!=dm]
{actionRow:$get[badges]:$get[banners]}
$endif
;$messageID:false;no]

$let[title-enUS;CRBT Store - Home]

$let[banners;Banners,2,1,banners,$get[emoji3],false]
$let[emoji3;$replaceText[$replaceText[$replaceText[${emojis.store.banners};<:;];>;];:;|]|false]

$let[badges;Badges,2,1,badges,$get[emoji1],false]
$let[emoji1;$replaceText[$replaceText[$replaceText[${emojis.store.badges};<:;];>;];:;|]|false]

$let[purplets-enUS;Balance:${emojis.purplet} **$getGlobalUserVar[user_bank] Purplets**]
$let[preview-enUS;Preview any banner on your profile using the \`$getServerVar[prefix]preview <banner name>\` command!]

$if[$channelType!=dm]
$setUserVar[temp1;$authorID;$clientID;$guildID]
$endif

$argsCheck[<1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}