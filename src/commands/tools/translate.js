module.exports.command = {
    name: "translate",
    aliases: ["tr"],
    module: "tools",
    description_enUS: "Translates the desired text in the specified language.",
    usage_enUS: "<target language> <text to translate>",
    code: `
$reply[$messageID;
{author:Translated from $getObjectProperty[lang.enUS.$toLowercase[$getObjectProperty[given.lang]]] to $getObjectProperty[lang.enUS.$toLowercase[$getObjectProperty[translated.lang]]]}
{field:$getObjectProperty[lang.enUS.$toLowercase[$getObjectProperty[given.lang]]]:
\`\`\`text
$messageSlice[1]
\`\`\`
:no}
{field:$getObjectProperty[lang.enUS.$toLowercase[$getObjectProperty[translated.lang]]]:
\`\`\`text
$getObjectProperty[translated.text]
\`\`\`
:no}
{color:$getGlobalUserVar[color]}
;no]

$onlyIf[$getObjectProperty[status]==200;{execute:args}]

$createObject[$jsonRequest[https://translate-api.ml/translate?text=$uri[encode;$messageSlice[1]]&lang=$message[1]]]

$onlyIf[$getObjectProperty[lang.enUS.$toLowercase[$getObjectProperty[translated.lang]]]!=;{execute:args}]

$djsEval[
d.object.lang = require("../../../../../data/misc/languageShortCodes.json")
;]

$argsCheck[>2;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}