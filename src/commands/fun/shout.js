const e = "\\"

module.exports.command = {
    name: "shout",
    module: "fun",
    aliases: ["scream", "aaaaaaaaa"],
    description_enUS: "Shouts given text and sends it in a webhook, if <botname> has the required permissions.",
    usage_enUS: "<text>",
    botPerms: ["managewebhooks"],
    code: `
$if[$hasPermsInChannel[$channelID;$clientID;managewebhooks]==true]

    $deletecommand
    
    $djsEval[
    const webhook_id = "$getChannelVar[webhook_id]"
    const webhook_token = "$getChannelVar[webhook_token]"
    const { Webhook } = require('discord-webhook-node');
    const hook = new Webhook('https://discord.com/api/webhooks/' + webhook_id + '/' + webhook_token);

    hook.setUsername('$nickname'.toUpperCase());
    hook.setAvatar('$authorAvatar');
    
    let random = Math.random().toString(36).substr(2, 5);
    let str = "$get[message] a" + random;
    str2 = str.replaceAll(" a" + random, '')

    const { Util } = require("discord.js");
    let clean = Util.cleanContent(str2, message);

    hook.send("**" + clean.toUpperCase() + "!!!**");
    ]

    $if[$getChannelVar[webhook_id]$getChannelVar[webhook_token]==]

        $setChannelVar[webhook_id;$splitText[1]]
        $setChannelVar[webhook_token;$splitText[2]]

        $textSplit[$createWebhook[$channelID;CRBT Webhook;;yes;###];###]

    $endif

$else

    $reply[$messageID;
    {title:**$toUppercase[$message]!!!**}
    {color:$getGlobalUserVar[color]}
    ;no]

$endif

$let[message;$replaceText[$replaceText[$message;";'];\n;\\n]]

$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}
//    $createObject[{"message": "**$toUppercase[$replaceText[$replaceText[$message;";];${e};]]!!!**"}]
    