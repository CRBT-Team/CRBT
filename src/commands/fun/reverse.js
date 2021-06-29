module.exports.command = {
    name: "reverse",
    module: "fun",
    aliases: ["rv", "esrever"],
    description_enUS: "Reverses given text and sends it in a webhook, if <botname> has the required permissions.",
    usage_enUS: "<text>",
    botPerms: ["managewebhooks (recommended)"],
    code: `
$if[$hasPermsInChannel[$channelID;$clientID;managewebhooks]==true]

    $deletecommand
    
    $djsEval[
    const webhook_id = "$getChannelVar[webhook_id]"
    const webhook_token = "$getChannelVar[webhook_token]"
    const { Webhook } = require('discord-webhook-node');
    const hook = new Webhook('https://discord.com/api/webhooks/' + webhook_id + '/' + webhook_token);

    hook.setUsername('$nickname');
    hook.setAvatar('$authorAvatar');

    let random = Math.random().toString(36).substr(2, 5);
    let str = "$get[message] a" + random;
    str2 = str.replaceAll(" a" + random, '')

    const { Util } = require("discord.js");
    
    let clean1 = Util.cleanContent(str2, message);

    let content = clean1
    const pog = content.trim().split("").reverse().join("")
    
    let clean2 = Util.cleanContent(pog, message);

    hook.send(clean2);
    ]

    $if[$getChannelVar[webhook_id]$getChannelVar[webhook_token]==]

        $setChannelVar[webhook_id;$splitText[1]]
        $setChannelVar[webhook_token;$splitText[2]]

        $textSplit[$createWebhook[$channelID;CRBT Webhook;;yes;###];###]

    $endif

$else

    $reply[$messageID;
    {title:$getObjectProperty[reversed]}
    {color:$getGlobalUserVar[color]}
    ;no]

    $djsEval[
        let random = Math.random().toString(36).substr(2, 5);
        let str = "$get[message] a" + random;
        str2 = str.replaceAll(" a" + random, '')
    
        const { Util } = require("discord.js");
        
        let clean1 = Util.cleanContent(str2, message);
    
        let content = clean1
        const pog = content.trim().split("").reverse().join("")
        
        d.object.reversed = Util.cleanContent(pog, message);
    ]

$endif

$let[message;$replaceText[$replaceText[$replaceText[$message;";];enoyreve@;enoyreve‎@];ereh@;ereh‎@]]

$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
    `}