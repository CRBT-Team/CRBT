const { tokens } = require("../../../../index");

module.exports.command = {
    name: "porn",
    aliases: ["irl"],
    description_enUS: "Gives a random pornographic image.",
    module: "nsfw",
    code: `
$reply[$messageID;
{image:$jsonRequest[https://api.avux.ga/pgif;;;X-API-Key:${tokens.avux}]}
{color:$getGlobalUserVar[color]}
;no]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyNSFW[{execute:nsfw}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$getGlobalUserVar[experimentalFeatures]==true;{execute:experimentalFeatures}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
    `}

// $reactionCollector[$botLastMessageID;$authorID;10m;${emojis.music.loop};shufflensfw;yes]