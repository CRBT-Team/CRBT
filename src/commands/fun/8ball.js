const { emojis } = require("../../../index");

module.exports.command = {
  name: "8ball",
  module: "fun",
  aliases: ["8b"],
  description_enUS: "Askes your question to 8-Ball and gives you its honest answer.",
  usage_enUS: "<question (answerable by \"yes\" or \"no\")>",
  botperms: "",
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
$let[answer-enUS;$randomText[Yeah;Definitely not;I'm not sure...;Nope!;It may seem like it's a yes, but in fact no!;Absolutely;As I see it, yes.;Kind of...;Maybe not;Probably.;Of course!]]
$let[footer-enUS;Disclaimer: While 8-Ball has proven its efficiency and reliability over time and tests, it may not give accurate information all of the time.]
$let[progress-enUS;${emojis.misc.eightball} 8-Ball is thinking...]

$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=]$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]$endif
$setGlobalUserVar[lastCmd;$commandName]
  `}