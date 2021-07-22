const { emojis, tokens } = require("../../../index");

module.exports.command = {
    name: "blowjob",
    aliases: ["bj", "suck", "dicksuck", "fellation"],
    description_enUS: "Gives a random hentai image of a blowjob.",
    module: "nsfw",
    code: `
$reply[$messageID;
{image:$randomText[$jsonRequest[https://nekos.life/api/v2/img/blowjob;url];$jsonRequest[https://api.avux.ga/blowjob;;;X-API-Key:${tokens.avux}]]}
{color:$getGlobalUserVar[color]}
;no]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyNSFW[{execute:nsfw}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}

// $reactionCollector[$botLastMessageID;$authorID;10m;${emojis.music.loop};shufflensfw;yes]