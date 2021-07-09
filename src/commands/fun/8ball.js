const { emojis } = require("../../../index");

module.exports.command = {
  name: "8ball",
  module: "fun",
  aliases: ["8b"],
  description_enUS: "Askes your question to 8-Ball and gives you its honest answer.",
  usage_enUS: "<question (answerable by \"yes\" or \"no\")>",
  code: `
$editMessage[$botLastMessageID;
{title:$get[title-$getGlobalUserVar[language]]}
{description:$get[answer-$getGlobalUserVar[language]]}
{color:$getGlobalUserVar[color]}
;$channelID]

$wait[500ms]

$reply[$messageID;
{title:$get[progress-$getGlobalUserVar[language]]}
{color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;${emojis.misc.eightball} 8-Ball]
$let[answer-enUS;$randomText[🟢 Yeah!;🔴 Definitely, no.;🟠 I'm not sure...;🔴 Nah...;🔴 It may seem like it's a yes, but in fact nope!;🟢 Absolutely.;🟢 As I see it, yes.;🟠 Sort of...;🔴 Maybe not.;🟢 Probably.;🟢 Of course!]]
$let[progress-enUS;${emojis.misc.eightball} 8-Ball is thinking...]

$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
  `}