module.exports.command = {
    name: "define",
    module: "info",
    code:`
$attachment[$getObjectProperty[e.phonetics[0].audio];Pronounciation.mp3]
$reply[$messageID;
{title:$getObjectProperty[e.word] ($getObjectProperty[e.meanings[0].partOfSpeech])}

{field:Phonetics:
$getObjectProperty[e.phonetics[0].text]
:no}

{field:Definition:
$getObjectProperty[b.definition]
:no}

{field:Example:
$replaceText[$replaceText[$checkCondition[$getObjectProperty[b.example]==];false;$replaceText[$getObjectProperty[b.example]; $getObjectProperty[e.word]; **$getObjectProperty[e.word]**]];true;*None*]
:no}

{field:Synonyms:
$replaceText[$replaceText[$checkCondition[$getObjectProperty[b.synonyms]==];false;$replaceText[$getObjectProperty[b.synonyms];,;, ]];true;*None*]
:yes}

{color:$getGlobalUserVar[color]}
;no]

$createFile[$getObject;object.json]

$onlyIf[$getObjectProperty[y]!=yoo;not found]

$djsEval[
const fetch = require("node-fetch");

fetch("https://api.dictionaryapi.dev/api/v2/entries/en_US/" + "$getObjectProperty[message]")
  .then((res) => res.json())
  .then((res) => {
    d.object.e = res[0];
    d.object.b = res[0].meanings[0].definitions[0];
  })
  .on("error", () => {
    d.object.y = "yoo"
  });]
  
$createObject[{"message": "$message"}]

$argsCheck[1;{execute:args}]

$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
    `}