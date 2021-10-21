const { misc } = require('../../..');

module.exports.command = {
    name: "translate",
    aliases: ["tr"],
    module: "tools",
    description_enUS: "Translates the desired text in the specified language.",
    usage_enUS: "<target language> <text to translate> < -from <source language> (optional)>",
    examples_enUS: [
        "translate english Bonjour ! Je suis David !",
        "tr turkish The cat is in the box. What is it doing? -from english",
        "translate es Sonntagsbraten -from de"
    ],
    code: `
$reply[$messageID;
{author:Translated from $getObjectProperty[from.lang] to $getObjectProperty[to.lang]}
{field:$getObjectProperty[from.lang]:
\`\`\`
$get[text]\`\`\`
:no}
{field:$getObjectProperty[to.lang]:
\`\`\`
$getObjectProperty[to.text]\`\`\`
:no}
$get[$replaceText[$replaceText[$checkCondition[$getObjectProperty[from.correctedText]==];true;];false;didyoumean]]
{color:$getGlobalUserVar[color]}
;no]

$let[didyoumean;
{field:Did you mean?:
$replaceText[$replaceText[$getObjectProperty[from.correctedText];#LEFT#;**];#RIGHT#;**]
:no}
]

$onlyIf[$getObjectProperty[status]==200;{execute:args}]

$if[$clientID!=${misc.CRBTid}]
$createObject[$jsonRequest[http://localhost:${process.env.port}/other/translate?text=$get[text]&from=$get[from]&to=$get[to];;{execute:args}]
$else
$createObject[$jsonRequest[https://api.clembs.xyz/other/translate?text=$get[text]&from=$get[from]&to=$get[to];;{execute:args}]
$endif

$let[text;$advancedTextSplit[$messageSlice[1]; -from ;1]]
$let[from;$advancedTextSplit[$messageSlice[1]; -from ;2]]
$let[to;$message[1]]

$argsCheck[>2;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}