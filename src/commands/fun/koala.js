module.exports.command = {
    name: "koala",
    description_enUS: "Gives a random koala image & fact!",
    module: "fun",
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}
{field:$get[dyk-$getGlobalUserVar[language]]}
{image:$jsonRequest[https://some-random-api.ml/img/koala;link]}
{color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;🐨 Random koala!]
$let[dyk-enUS;Did you know?:$jsonRequest[https://some-random-api.ml/facts/koala;fact]]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=]$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]$endif
$setGlobalUserVar[lastCmd;$commandName]
    `}