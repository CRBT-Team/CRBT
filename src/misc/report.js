const colors = require('../../json/colors.json');
const emojis = require('../../json/emojis.json');

module.exports.command = {
  name: "report",
  module: "misc",
  aliases: ["bugreport", "bug", "sendreport"],
  description_enUS: "Sends a bug report about CRBT in the Clembs Server (english only).",
  usage_enUS: "<bug report message (may include images)>",
  botperms: "",
  cooldown: "10s",
  code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}
{description:$get[description-$getGlobalUserVar[language]]}
{color:${colors.cyan}}
;no]

$useChannel[$get[channel]]

$title[Bug report]

$description[<@!$authorID> in [**$serverName[$guildID]**](https://discord.com/channels/$guildID/$channelID/$messageID)
\`\`\`
$replaceText[$replaceText[$replaceText[$replaceText[$getObjectProperty[cleanedReport];\`;];|;];*;];_;] 
\`\`\`
$disableMentions $disableChannelMentions $disableRoleMentions
]

$djsEval[const { Util } = require("discord.js");
d.object.cleanedReport = Util.cleanContent("$getObjectProperty[report]", message);
]

$createObject[{"report":"$message"}]


$if[$messageAttachment!=]
$image[$messageAttachment]
$endif

$addField[Status;
Pending
;no]

$footer[$randomString[10] | $authorID]

$color[${colors.yellow}]

$let[title-enUS;${emojis.general.success} Report sent]
$let[description-enUS;Your bug report was sent to Clembs, CRBT's developer. Please do not spam the command or send invalid/joke issues, as you could get blocklisted forever.]

$argsCheck[>1;{execute:args}]

$let[channel;$replaceText[$replaceText[$clientID;595731552709771264;${links.channels.report}];833327472404594688;${links.channels.reportDev}]]

$globalCooldown[$commandInfo[$commandName;cooldown];{execute:cooldown}]
$setGlobalUserVar[last_cmd;$commandName]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
  `}