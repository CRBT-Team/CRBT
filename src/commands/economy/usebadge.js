const { emojis, colors } = require("../../../index");

module.exports.command = {
    name: "badge",
    aliases: ["add_badge", "add-badge", "use-badge", "usebadge", "addbadge", "use_badge"],
    module: "economy",
    description_enUS: "Adds the specified badge to your profile (as long as it is in your inventory).",
    usage_enUS: "<badge name (e.g. \"udu\")>",
    code: `
$setGlobalUserVar[profile_badges;$replaceText[$replaceText[$replaceText[$replaceText[$getGlobalUserVar[profile_badges];french;france];russian;russia];None; ] <badge $replaceText[$toLowercase[$message]; ;]>;  ; ]]
$setGlobalUserVar[invbadge;$replaceText[$replaceText[$getGlobalUserVar[invbadge];french;france];russian;russia]]

$reply[$messageID;
{title:${emojis.general.success} Badge applied}

{description:
The $getObjectProperty[badge.$get[item].contents] $getObjectProperty[badge.$get[item].name] badge has been applied to your profile.
}

{color:${colors.success}}
;no]

$onlyIf[$checkContains[$replaceText[$replaceText[$getGlobalUserVar[profile_badges];french;france];russian;russia];badge $replaceText[$toLowercase[$message]; ;]]==false;{execute:onProfile}]

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