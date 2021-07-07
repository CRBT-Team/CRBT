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
  `,
  //     code: `
  // $reply[$messageID;
  // {title:$get[title-$getGlobalUserVar[language]]}
  // {field:$get[dyk-$getGlobalUserVar[language]]}
  // {image:$jsonRequest[https://some-random-api.ml/img/dog;link]}
  // {color:$getGlobalUserVar[color]}
  // ;no]

  // $let[title-enUS;🐶 Random dog!]
  // $let[dyk-enUS;Did you know?:$jsonRequest[https://some-random-api.ml/facts/dog;fact]]

  // $argsCheck[0;{execute:args}]
  // $onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
  // $onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
  // $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
  // $setGlobalUserVar[lastCmd;$commandName]
  /*`*/
};
