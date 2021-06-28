module.exports.command = {
    name: "panda",
    description_enUS: "Gives a random panda image & fact!",
    module: "fun",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}
{field:$get[dyk-$getGlobalUserVar[language]]}
{image:$jsonRequest[https://some-random-api.ml/img/panda;link]}
{color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;🐼 Random panda!]
$let[dyk-enUS;Did you know?:$jsonRequest[https://some-random-api.ml/facts/panda;fact]]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=]$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]$endif
$setGlobalUserVar[lastCmd;$commandName]
    `}