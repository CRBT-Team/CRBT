module.exports.command = {
    name: "feet",
    aliases: ["foot", "toes"],
    description_enUS: "Gives a random lewd image of fictional characters' feet.",
    module: "nsfw",
    code: `
$reply[$messageID;
{image:$jsonRequest[https://nekos.life/api/v2/img/feet;url]}
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