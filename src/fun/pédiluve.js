module.exports.command = {
    name: "pédiluve",
    module: "fun",
    description_enUS: "A random footbath image (secret command).",
    code: `
$reply[$messageID;
{image:$jsonRequest[http://localhost:${process.env.port}/pediluve;image]}
{color:$getGlobalUserVar[color]}
;no]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=]$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]$endif
$setGlobalUserVar[lastCmd;$commandName]
    `}