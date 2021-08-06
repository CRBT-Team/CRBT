module.exports.command = {
    name: "shout",
    module: "fun",
    aliases: ["scream", "aaaaaaaaa"],
    description_enUS: "Shouts given text and sends it in a webhook, if <botname> has the required permissions.",
    usage_enUS: "<text>",
    botPerms: ["managewebhooks"],
    code: `
$if[$hasPermsInChannel[$channelID;$clientID;managewebhooks]==true]

    $if[$getChannelVar[webhook_id]$getChannelVar[webhook_token]==]

    $deletecommand
    
    $djsEval[
    const url = "https://discord.com/api/webhooks/$getChannelVar[webhook_id]/$getChannelVar[webhook_token]"
    const { Webhook } = require('discord-webhook-node');
    const hook = new Webhook(url);

    hook.setUsername('$nickname'.toUpperCase());
    hook.setAvatar('$authorAvatar');
    
    const { Util } = require("discord.js");
    let clean = Util.cleanContent("$get[message]", message);

    hook.send("**" + clean.toUpperCase() + "!!!**");
    ]

    $wait[200ms]

    $setChannelVar[webhook_id;$splitText[1]]
    $setChannelVar[webhook_token;$splitText[2]]

    $textSplit[$createWebhook[$channelID;CRBT Webhook;;yes;###];###]

    $else
    
    $deletecommand
    
    $djsEval[
    const url = "https://discord.com/api/webhooks/$getChannelVar[webhook_id]/$getChannelVar[webhook_token]"
    const { Webhook } = require('discord-webhook-node');
    const hook = new Webhook(url);

    hook.setUsername('$nickname'.toUpperCase());
    hook.setAvatar('$authorAvatar');
    
    const { Util } = require("discord.js");
    let clean = Util.cleanContent("$get[message]", message);

    hook.send("**" + clean.toUpperCase() + "!!!**");
    ]

    $endif

$else

    $reply[$messageID;
    {title:**$get[message]!!!**}
    {color:$getGlobalUserVar[color]}
    ;no]

$endif

$let[message;$replaceText[$replaceText[$toUppercase[$message];";'];\n;\\n]]

$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}
//    $createObject[{"message": "**$toUppercase[$replaceText[$replaceText[$message;";];${e};]]!!!**"}]
    