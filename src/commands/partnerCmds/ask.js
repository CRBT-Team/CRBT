const { colors, emojis } = require("../../../index");

module.exports.command = {
    name: "ask",
    description_enUS: "Ask a question anonymously to [Clembs](https://clembs.xyz/questions).",
    usage_enUS: "<question>",
    module: "partnerCmd",
    server: "738747595438030888",
    cooldown: "1m",
    code: `
$deleteCommand    
$deleteMessage[$get[id]]

$wait[1s]

$let[id;$botLastMessageID]
$reply[$messageID;
{title:$get[success-$getGlobalUserVar[language]]}
{color:${colors.success}}
;no]

$get[success-enUS;${emojis.success} Question sent to #$channelName[822824525724123157].]

$djsEval[
const { Webhook } = require('discord-webhook-node');
const hook = new Webhook('https://discord.com/api/webhooks/822888056763711509/uCNlcY1EbHti28P43_upFFqDhlqlH8mSBRtme7dym7q9JRFnej2VAPu0O_LtkRJxULJ3');
  
hook.send('$replaceText[$replaceText[$noMentionMessage;@everyone;@‎everyone];@here;@‎here]');
]

$globalCooldown[$commandInfo[$commandName;cooldown];{execute:cooldown}]
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$onlyForServers[$commandInfo[$commandName;server];]
    `}