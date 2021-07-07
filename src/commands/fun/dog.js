module.exports.command = {
  name: "dog",
  description_enUS: "Gives a random dog image & fact!",
  module: "fun",
  aliases: ["doggo", "doggy"],
  code: `
  $reply[$messageID;
     {title:$getObjectProperty[animal.name]}
     {description:$getObjectProperty[fact]}
     {image:$getObjectProperty[animal.image]}
     {color:$getGlobalUserVar[color]}
  ;no]
  $createObject[$jsonRequest[http://localhost:15019/other/animal/random/dog]]

  $argsCheck[0;{execute:args}]
  $onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
  $onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
  $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
  $setGlobalUserVar[lastCmd;$commandName]
  
$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}
