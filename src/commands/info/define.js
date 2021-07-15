module.exports.command = {
    name: "define",
    aliases: ['dictionary', 'dictio', 'word', 'definition'],
    description_enUS: "Defines a word on Google Dictionary",
    usage_enUS: "<english word>",
    module: "info",
    code:`
$attachment[$getObjectProperty[res.phonetics[0].audio];Pronounciation.mp3]
$reply[$messageID;
{author:$getObjectProperty[res.word] ($getObjectProperty[res.meanings[0].partOfSpeech]) - Definition}

{field:Phonetics:
$getObjectProperty[res.phonetics[0].text]
:no}

{field:Definition:
$jsonRequest[https://api.dictionaryapi.dev/api/v2/entries/en_US/$message;#RIGHT#0#LEFT#.meanings#RIGHT#0#LEFT#.definitions#RIGHT#0#LEFT#.definition]
:no}

{field:Example:
$replaceText[$replaceText[$checkCondition[$getObjectProperty[res.meanings[0].definitions[0].example]==];false;$replaceText[$getObjectProperty[res.meanings[0].definitions[0].example]; $getObjectProperty[res.word]; **$getObjectProperty[res.word]**]];true;*None*]
:no}

{field:Synonyms:
$replaceText[$replaceText[$checkCondition[$getObjectProperty[res.meanings[0].definitions[0].synonyms]==];false;$replaceText[$getObjectProperty[res.meanings[0].definitions[0].synonyms];,;, ]];true;*None*]
:yes}

{color:$getGlobalUserVar[color]}
;no]

$djsEval[
let obj = $getObject
d.object.res = obj[0]
]

$createObject[$jsonRequest[https://api.dictionaryapi.dev/api/v2/entries/en_US/$message;;{execute:queryNotFound}]]

$argsCheck[1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}