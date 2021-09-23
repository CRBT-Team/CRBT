module.exports.command = {
    name: "breasts",
    aliases: ["boobs", "tits", "oppai", "animetits","boobies", "titties"],
    description_enUS: "Gives a random image of anime women breasts.",
    module: "nsfw",
    code: `
$reply[$messageID;
{image:$randomText[$jsonRequest[https://nekos.life/api/v2/img/boobs;url];$jsonRequest[https://nekos.life/api/v2/img/tits;url]]}
{color:$getGlobalUserVar[color]}
;no]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyNSFW[{execute:nsfw}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$getGlobalUserVar[experimentalFeatures]==true;{execute:experimentalFeatures}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]

$onlyIf[1==2;{execute:nsfwDisabled}]
    `}