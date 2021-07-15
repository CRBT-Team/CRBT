const { emojis, colors } = require("../../../index");

module.exports.command = {
    name: "removebadge",
    aliases: ["remove_badge", "remove-badge"],
    module: "economy",
    description_enUS: "Removes the specified badge to your profile.",
    usage_enUS: "<badge name (e.g. \"udu\")>",
    code: `
$setGlobalUserVar[profile_badges;$replaceText[$getGlobalUserVar[profile_badges];<badge $toLowercase[$message]>;]]

$reply[$messageID;
{title:${emojis.general.success} Badge removed}

{description:
The $getObjectProperty[badge.$get[item].contents] $getObjectProperty[badge.$get[item].name] badge has been removed from your profile.
}

{color:${colors.success}}
;no]

$onlyIf[$checkContains[$replaceText[$replaceText[$getGlobalUserVar[profile_badges];french;france];russian;russia];badge $replaceText[$toLowercase[$message]; ;]]==true;{execute:onProfile}]

$onlyIf[$checkContains[$replaceText[$replaceText[$getGlobalUserVar[invbadge];french;france];russian;russia];badge $replaceText[$toLowercase[$message]; ;]]==true;{execute:notInInv}]

$onlyIf[$getObjectProperty[badge.$get[item].contents]!=;{execute:unknownItem}]

$let[item;$replaceText[$toLowercase[$message]; ;]]

$djsEval[const { items } = require("../../../../../index");
d.object.badge = items.badges;]

$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}