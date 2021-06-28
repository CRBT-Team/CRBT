module.exports.command = {
    name: "cat",
    description_enUS: "Gives a random cat image & fact!",
    module: "fun",
    aliases: ['meow', "neko", "kitty", "kitten"],
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}
{field:$get[dyk-$getGlobalUserVar[language]]}
{image:$jsonRequest[https://some-random-api.ml/img/cat;link]}
{color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;$get[kot] Random cat!]
$let[dyk-enUS;Did you know?:$jsonRequest[https://some-random-api.ml/facts/cat;fact]]
$let[kot;$randomText[🐱;😽;😼;😾;🐈;🙀;😿;😻;😸;😺;😹;🐈‍⬛]]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=]$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]$endif
$setGlobalUserVar[lastCmd;$commandName]
    `}