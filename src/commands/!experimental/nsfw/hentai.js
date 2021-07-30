const { tokens } = require("../../../../index");

module.exports.command = {
    name: "hentai",
    aliases: ["hnt"],
    description_enUS: "Gives a random hentai image.",
    module: "nsfw",
    code: `
$reply[$messageID;
{image:$randomText[$jsonRequest[https://nekos.life/api/v2/img/hentai;url];$jsonRequest[https://api.avux.ga/hentai;;;X-API-Key:${tokens.avux}]]}
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