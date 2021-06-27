const { emojis } = require("../../../index");

module.exports.command = {
  name: "shuffletext",
  module: "fun",
  aliases: ["shf", "textshuffle"," shufflet"],
  description_enUS: "Shuffles words in a given text.",
  usage_enUS: "<text>",
  code: `
$reply[$messageID;
{title:$getObjectProperty[shuffle]}
{color:$getGlobalUserVar[color]}
;no]

$djsEval[let text = "$getObjectProperty[message]"
let nText = text.trim().split(" ");
const shifted = nText.shift()
nText.push(shifted);
nText = nText.join(" ");
d.object.shuffle = nText]

$createObject[{"message":"$message"}]

$argsCheck[>2;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=]$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]$endif
$setGlobalUserVar[lastCmd;$commandName]
  `}