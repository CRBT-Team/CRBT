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

$if[$get[example]!=]

  {field:Example:
  $replaceText[$getObjectProperty[b.example]; $getObjectProperty[e.word]; **$getObjectProperty[e.word]**]
  :no}

$endif

$if[$get[synonyms]!=]

  {field:Synonyms:
  $replaceText[$getObjectProperty[b.synonyms];,;, ]
  :yes}

$endif

{color:$getGlobalUserVar[color]}
;no]

$let[example;$getObjectProperty[b.example]]
$let[synonyms;$getObjectProperty[b.synonyms]]

$djsEval[
const fetch = require("node-fetch");

fetch("https://api.dictionaryapi.dev/api/v2/entries/en_US/" + "$getObjectProperty[message]")
  .then((res) => res.json())
  .then((res) => {
    d.object.e = res[0];
    d.object.b = res[0].meanings[0].definitions[0];
  });]
  
$createObject[{"message": "$message"}]

$argsCheck[1;{execute:args}]

$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
    `}