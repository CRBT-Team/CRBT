module.exports.command = {
    name: "fox",
    description_enUS: "Gives a random fox image & fact!",
    module: "fun",
    aliases: ["foxxo", "floof"],
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}
{field:$get[dyk-$getGlobalUserVar[language]]}
{image:$jsonRequest[https://some-random-api.ml/img/fox;link]}
{color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;🦊 Random fox!]
$let[dyk-enUS;Did you know?:$jsonRequest[https://some-random-api.ml/facts/fox;fact]]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}