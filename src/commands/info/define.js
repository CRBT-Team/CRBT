module.exports.command = {
    name: "define",
    aliases: ['dictionnary', 'dictio', 'word', 'definition'],
    description_enUS: "Defines a word on Google Dictionnary",
    usage: "<english word>",
    module: "info",
    code:`
$attachment[$getObjectProperty[e.phonetics[0].audio];Pronounciation.mp3]
$reply[$messageID;
{title:$getObjectProperty[e.word] ($getObjectProperty[e.meanings[0].partOfSpeech])}

{field:Phonetics:
$getObjectProperty[e.phonetics[0].text]
:no}

{field:Definition:
$jsonRequest[https://api.dictionaryapi.dev/api/v2/entries/en_US/$message;#RIGHT#0#LEFT#.meanings#RIGHT#0#LEFT#.definitions#RIGHT#0#LEFT#.definition]
:no}

{field:Example:
$replaceText[$replaceText[$checkCondition[$getObjectProperty[e.meanings[0].definitions[0].example]==];false;$replaceText[$getObjectProperty[e.meanings[0].definitions[0].example]; $getObjectProperty[e.word]; **$getObjectProperty[e.word]**]];true;*None*]
:no}

{field:Synonyms:
$replaceText[$replaceText[$checkCondition[$getObjectProperty[e.meanings[0].definitions[0].synonyms]==];false;$replaceText[$getObjectProperty[e.meanings[0].definitions[0].synonyms];,;, ]];true;*None*]
:yes}

{color:$getGlobalUserVar[color]}
;no]

$onlyIf[$getObjectProperty[e.resolution]==;{execute:args}]

$djsEval[
const fetch = require("node-fetch");

fetch("https://api.dictionaryapi.dev/api/v2/entries/en_US/" + "$getObjectProperty[message]")
  .then((res) => res.json())
  .then((res) => {
    d.object.e = res[0];
  })]
  
$createObject[{"message": "$message"}]

$argsCheck[1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}