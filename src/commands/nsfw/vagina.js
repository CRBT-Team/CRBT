const { emojis } = require("../../../index");

module.exports.command = {
    name: "vagina",
    aliases: ["pussy"],
    description_enUS: "Gives a random image of the a fictional characters' vagina.",
    module: "nsfw",
    code: `
$reactionCollector[$botLastMessageID;$authorID;10m;${emojis.music.loop};shufflensfw;yes]

$reply[$messageID;
{image:$randomText[$jsonRequest[https://nekos.life/api/v2/img/pussy;url];$jsonRequest[https://nekos.life/api/v2/img/pussy_jpg;url]]}
{color:$getGlobalUserVar[color]}
;no]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyNSFW[{execute:nsfw}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=]$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]$endif
$setGlobalUserVar[lastCmd;$commandName]
    `}