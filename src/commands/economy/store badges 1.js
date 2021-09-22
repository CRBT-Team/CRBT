const { logos, emojis, illustrations } = require("../../..");
const { badges, badges2, banners } = require("../../../data/misc/store-pages")

const p = {
    title: 'CRBT Store -',
    protip: 'You can get info on any item using the \`<prefix>iteminfo <item name>\` command!',
    preview: 'Preview any banner on your profile using the `<prefix>preview <banner name>` command!',
};

module.exports.awaitedCommand = {
    name: "badges",
    code: `
$editMessage[$message[1];

    {author:${p.title} Badges (Page 1):${logos.CRBTsmall}}

    {description:$get[protip]}

    {field:$get[purplets]:no}

    $eval[$replaceText[${badges};<prefix>;$getServerVar[prefix]];yes]

    {thumbnail:${illustrations.badges}}
    {color:$getGlobalUserVar[color]}

;$channelID]


$let[purplets;Balance:${emojis.purplet} $getGlobalUserVar[user_bank] Purplets]
$let[preview;Preview any banner on your profile using the \`$getServerVar[prefix]preview <banner name>\` command!]
$let[protip;You can get info on any item using the \`$getServerVar[prefix]iteminfo <item name>\` command!]
    `}