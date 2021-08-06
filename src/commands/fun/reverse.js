module.exports.command = {
    name: "reverse",
    module: "fun",
    aliases: ["rv", "esrever"],
    description_enUS: "Reverses given text and sends it in a webhook, if <botname> has the required permissions.",
    usage_enUS: "<text>",
    botPerms: ["managewebhooks", "managemessages"],
    code: `
$if[$hasPermsInChannel[$channelID;$clientID;managewebhooks]==true]

    $if[$getChannelVar[webhook_id]$getChannelVar[webhook_token]==]

    $deletecommand

    $djsEval[
    const url = "https://discord.com/api/webhooks/$getChannelVar[webhook_id]/$getChannelVar[webhook_token]"
    const { Webhook } = require('discord-webhook-node');
    const hook = new Webhook(url);

    let nick = "$get[nick]"
    const revNick = nick.trim().split("").reverse().join("")
    hook.setUsername(revNick);
    hook.setAvatar('$authorAvatar');

    const { Util } = require("discord.js");
    let content = Util.cleanContent("$get[message]", message);
    const reversed = content.trim().split("").reverse().join("")
    
    let reclean = Util.cleanContent(reversed, message);
    hook.send(reclean);
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

    let nick = "$get[nick]"
    const revNick = nick.trim().split("").reverse().join("")
    hook.setUsername(revNick);
    hook.setAvatar('$authorAvatar');

    const { Util } = require("discord.js");
    let content = Util.cleanContent("$get[message]", message);
    const reversed = content.trim().split("").reverse().join("")
    
    let reclean = Util.cleanContent(reversed, message);
    hook.send(reclean);
    ]

    $endif

$else

    $reply[$messageID;
    {title:$getObjectProperty[reversed]}
    {color:$getGlobalUserVar[color]}
    ;no]

    $djsEval[
        const { Util } = require("discord.js");
        let content = Util.cleanContent("$get[message]", message);

        const reversed = content.trim().split("").reverse().join("")
        d.object.reversed = Util.cleanContent(reversed, message);
    ]

$endif

$let[nick;$nickname]
$let[message;$replaceText[$replaceText[$replaceText[$replaceText[$message;enoyreve@;enoyreve‎@]ereh‎@;];";'];\n;\\n]]

$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}