const { colors, emojis, links } = require("../../../index");

module.exports.command = {
  name: "suggest",
  module: "misc",
  aliases: ["feedback", "request", "suggestion"],
  description_enUS: "Sends a suggestion for CRBT (english only).",
  usage_enUS: "<suggestion (may include images)>",
  cooldown: "10s",
  code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}
{description:$get[description-$getGlobalUserVar[language]]}
{color:${colors.success}}
;no]

$useChannel[$get[channel]]

$title[Suggestion]

$description[<@!$authorID> in [**$serverName[$guildID]**](https://discord.com/channels/$guildID/$channelID/$messageID)
\`\`\`
$replaceText[$replaceText[$replaceText[$replaceText[$getObjectProperty[cleanedReport];\`;];|;];*;];_;] 
\`\`\`
]

$djsEval[const { Util } = require("discord.js");
d.object.cleanedReport = Util.cleanContent("$get[report]", message);
]

$djsEval[
  let random = Math.random().toString(36).substr(2, 5);
  let str = "$get[report] a" + random;
  str2 = str.replaceAll(" a" + random, '')

  const { Util } = require("discord.js");
  d.object.cleanedReport = Util.cleanContent(str2, message);
]

$let[report;$replaceText[$message;";']]

$if[$messageAttachment!=]
$image[$messageAttachment]
$endif

$addField[Status;
Pending
;no]

$color[${colors.yellow}]

$let[title-enUS;${emojis.general.success} Suggestion sent]
$let[description-enUS;Your suggestion was sent to Clembs, CRBT's developer. Please do not spam the command or send invalid/joke issues, as you could get blocklisted forever.]

$let[channel;$replaceText[$replaceText[$checkCondition[$clientID==595731552709771264];true;${links.channels.report}];false;${links.channels.reportDev}]]

$globalCooldown[$commandInfo[$commandName;cooldown];{execute:cooldown}]
$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
  `}