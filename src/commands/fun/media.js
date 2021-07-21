module.exports.command = {
    name: "m/",
    nonPrefixed: true,
    module: "fun",
    description_enUS: "Replaces your message with a media from Clembs.xyz.",
    usage_enUS: "<text>",
    botPerms: ["managewebhooks"],
    code: `
$if[$hasPermsInChannel[$channelID;$clientID;managewebhooks]==true]

    $if[$getChannelVar[webhook_id]$getChannelVar[webhook_token]==]

    $deletecommand
    
    $djsEval[
    const webhook_id = "$getChannelVar[webhook_id]"
    const webhook_token = "$getChannelVar[webhook_token]"
    const { Webhook } = require('discord-webhook-node');
    const hook = new Webhook('https://discord.com/api/webhooks/' + webhook_id + '/' + webhook_token);

    hook.setUsername('$nickname');
    hook.setAvatar('$authorAvatar');
        
    hook.send("$get[message]");
    ]

    $wait[200ms]

    $setChannelVar[webhook_id;$splitText[1]]
    $setChannelVar[webhook_token;$splitText[2]]
    
    $textSplit[$createWebhook[$channelID;CRBT Webhook;;yes;###];###]
    
    $else
    
    $deletecommand
    
    $djsEval[
    const webhook_id = "$getChannelVar[webhook_id]"
    const webhook_token = "$getChannelVar[webhook_token]"
    const { Webhook } = require('discord-webhook-node');
    const hook = new Webhook('https://discord.com/api/webhooks/' + webhook_id + '/' + webhook_token);

    hook.setUsername('$nickname');
    hook.setAvatar('$authorAvatar');
    
    hook.send("$get[message]");
    ]

    $endif

$else

    $reply[$messageID;
    {title:$get[message]}
    {color:$getGlobalUserVar[color]}
    ;no]

$endif

$let[message;https://clembs.xyz/media/$replaceText[$replaceText[$replaceText[$message; ;-];";];\n;]]

$onlyIf[$checkContains[$stringEndsWith[$message;.png]$stringEndsWith[$message;.gif]$stringEndsWith[$message;.mp4]$stringEndsWith[$message;.wav];true]==true;]

$argsCheck[>1;]
$onlyIf[$getGlobalUserVar[blocklisted]==false;]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}    