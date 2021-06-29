const { emojis, tokens } = require("../../../index");

module.exports.command = {
    name: "lesbian",
    aliases: ["les"],
    description_enUS: "Gives a random hentai image of two or more women.",
    module: "nsfw",
    code: `
$reactionCollector[$botLastMessageID;$authorID;10m;${emojis.music.loop};shufflensfw;yes]

$reply[$messageID;
{image:$jsonRequest[https://nekos.life/api/v2/img/les;url]}
{color:$getGlobalUserVar[color]}
;no]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyNSFW[{execute:nsfw}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
    `}