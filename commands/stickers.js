const webhook_id = "$getChannelVar[webhook_id]"
const webhook_token = "$getChannelVar[webhook_token]"

module.exports.command = {
  name: " ",
  description_enUS: "Reposts your message with the desired emoji.",
  usage_enUS: "{text}",
  module: "utility",
  code: `
  $djsEval[
    const webhook_id = "$getChannelVar[webhook_id]"
    const webhook_token = "$getChannelVar[webhook_token]"
    const { Webhook } = require('discord-webhook-node');
    const hook = new Webhook('https://discord.com/api/webhooks/${webhook_id}/${webhook_token}');
  
    hook.setUsername('$nickname');
    hook.setAvatar('$authorAvatar');
    
    hook.send("$splitText[1] $customEmoji[$splitText[2]] $splitText[3]");
    ]
    
$textSplit[$replaceText[$message;:;@];@]
  
    $if[$getChannelVar[webhook_id]==]
  
      $setChannelVar[webhook_id;$splitText[1]]
      $setChannelVar[webhook_token;$splitText[2]]
  
      $textSplit[$createWebhook[$channelID;CRBT Webhook;;yes;###];###]
  
    $endif
    
$deletecommand

$onlyIf[$splitText[3]!=;]


$onlyForIDs[327690719085068289;]
$setGlobalUserVar[last_cmd;$commandName]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID==] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
  `}