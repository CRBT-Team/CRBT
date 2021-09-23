module.exports.command = {
    name: "vagina",
    aliases: ["pussy"],
    description_enUS: "Gives a random image of the a fictional characters' vagina.",
    module: "nsfw",
    code: `
$reply[$messageID;
{image:$randomText[$jsonRequest[https://nekos.life/api/v2/img/pussy;url];$jsonRequest[https://nekos.life/api/v2/img/pussy_jpg;url]]}
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