const { logos, emojis, illustrations } = require("../../..");
const { badges, badges2, banners } = require("../../../data/misc/store-pages")

const p = {
    title: 'CRBT Store -',
    protip: 'You can get info on any item using the \`<prefix>iteminfo <item name>\` command!',
    preview: 'Preview any banner on your profile using the `<prefix>preview <banner name>` command!',
};

module.exports.command = {
    name: "store",
    aliases: ["shop"],
    description_enUS: "Brings the CRBT Store up.",
    usage_enUS: "<banners | badges (optional)>",
    module: "economy",
    code: `
$reactionCollector[$get[id];$authorID;1h;${emojis.store.badges},😎,${emojis.store.banners};badges,badges2,banners;yes]

$let[id;$apiMessage[;

$if[$message==]

    {author:${p.title} Badges (Page 1):${logos.CRBTsmall}}

    {description:$get[protip]}

    {field:$get[purplets]:no}

    $eval[$replaceText[${badges};<prefix>;$getServerVar[prefix]];yes]

    {thumbnail:${illustrations.badges}}

$elseIf[$toLowercase[$message]==badges]

    {author:${p.title} Badges (Page 1):${logos.CRBTsmall}}

    {description:$get[protip]}

    {field:$get[purplets]:no}

    $eval[$replaceText[${badges};<prefix>;$getServerVar[prefix]];yes]

    {thumbnail:${illustrations.badges}}

$endelseIf
$elseIf[$toLowercase[$message]==banners]

    {author:${p.title} Banners:${logos.CRBTsmall}}

    {description:$get[preview]}

    {field:$get[purplets]:no}

    $eval[$replaceText[${banners};<prefix>;$getServerVar[prefix]];yes]

    {thumbnail:${illustrations.banners}}

$endelseIf
$else
    $loop[1;args]
$endif

{color:$getGlobalUserVar[color]}
;
;$messageID:false;yes]]

$let[purplets;Balance:${emojis.purplet} $getGlobalUserVar[user_bank] Purplets]

$argsCheck[<1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}