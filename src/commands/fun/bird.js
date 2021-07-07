module.exports.command = {
    name: "bird",
    description_enUS: "Gives a random bird image & fact!",
    module: "fun",
    aliases: ["pioupiou", "birb", "birdo"],
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}
{field:$get[dyk-$getGlobalUserVar[language]]}
{image:$jsonRequest[https://some-random-api.ml/img/bird;link]}
{color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;🐦 Random bird!]
$let[dyk-enUS;Did you know?:$jsonRequest[https://some-random-api.ml/facts/bird;fact]]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}