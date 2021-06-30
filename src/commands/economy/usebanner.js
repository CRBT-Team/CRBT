const { emojis, colors } = require("../../../index");

module.exports.command = {
    name: "banner",
    aliases: ["set_banner", "set-banner", "use-banner", "usebanner", "setbanner", "banner", "set banner"],
    module: "economy",
    description_enUS: "Changes your profile banner to a specified one you have in your inventory.",
    usage_enUS: "<banner name (e.g. \"bubbles\")>",
    code: `
$setGlobalUserVar[profile_banner;<banner $replaceText[$toLowercase[$message]; ;]>]

$reply[$messageID;
{title:${emojis.general.success} Banner applied}

{description:
The $getObjectProperty[banner.$get[item].name] banner has been applied to your profile.
}

{color:${colors.success}}
;no]

$onlyIf[$checkContains[$getGlobalUserVar[invbanner];banner $replaceText[$toLowercase[$message]; ;]]==true;{execute:notInInv}]

$onlyIf[$getObjectProperty[banner.$get[item].contents]!=;{execute:unknownItem}]

$let[item;$replaceText[$toLowercase[$message]; ;]]

$djsEval[const { items } = require("../../../../../index");
d.object.banner = items.banners;]

$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
    `}