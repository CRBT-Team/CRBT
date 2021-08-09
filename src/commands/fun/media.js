module.exports.command = {
    name: "m/",
    nonPrefixed: true,
    module: "fun",
    description_enUS: "Replaces your message with a corresponding file from clembs.xyz/media.",
    usage_enUS: "<valid file name>",
    botPerms: ["managewebhooks"],
    code: `
$if[$hasPermsInChannel[$channelID;$clientID;managewebhooks]==true]

    $if[$webhookExists[$getChannelVar[webhook_id];$getChannelVar[webhook_token]]==false]

    $deletecommand
    
    $djsEval[
    const url = "https://discord.com/api/webhooks/$getChannelVar[webhook_id]/$getChannelVar[webhook_token]"
    const { Webhook } = require('discord-webhook-node');
    const hook = new Webhook(url);

    hook.setUsername('$nickname');
    hook.setAvatar('$authorAvatar');
        
    hook.send("$getObjectProperty[message]");
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

    hook.setUsername('$nickname');
    hook.setAvatar('$authorAvatar');
    
    hook.send("$getObjectProperty[message]");
    ]

    $endif

$else

$reply[$messageID;
    $getObjectProperty[message]
;no]

$endif

$djsEval[
const { Util } = require("discord.js");
d.object.message = Util.cleanContent("$get[message]", message);]

$let[message;https://clembs.xyz/media/$replaceText[$replaceText[$replaceText[$replaceText[$replaceText[$message;@everyone;@‎everyone];@here;@‎here]; ;-];";];\n;]]

$onlyIf[$checkContains[$stringEndsWith[$message;.png]$stringEndsWith[$message;.gif]$stringEndsWith[$message;.mp4]$stringEndsWith[$message;.wav];true]==true;]

$argsCheck[>1;]
$onlyIf[$getGlobalUserVar[blocklisted]==false;]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}    