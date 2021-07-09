const { emojis, colors } = require("../../../index");

module.exports.command = {
    name: "removebanner",
    aliases: ["remove_banner", "remove-banner"],
    module: "economy",
    description_enUS: "Removes your current profile banner.",
    code: `
$setGlobalUserVar[profile_banner;$getVar[profile_banner]]

$reply[$messageID;
{title:${emojis.general.success} Banner removed}

{description:
Your current profile banner has been removed from your profile.
}

{color:${colors.success}}
;no]

$onlyIf[$getGlobalUserVar[profile_banner]!=$getVar[profile_banner];{execute:noBanner}]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}