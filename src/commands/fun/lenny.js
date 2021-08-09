module.exports.command = {
    name: "lenny",
    module: "fun",
    description_enUS: "Appends ( ͡° ͜ʖ ͡°) to your message.",
    usage_enUS: "<text (optional)>",
    botPerms: ["managewebhooks", "managemessages"],
    code: `
$if[$webhookExists[$getChannelVar[webhook_id];$getChannelVar[webhook_token]]==false]

$djsEval[
    const url = "https://discord.com/api/webhooks/$getChannelVar[webhook_id]/$getChannelVar[webhook_token]"
    const { Webhook } = require('discord-webhook-node');
    const hook = new Webhook(url);

    hook.setUsername("$nickname");
    hook.setAvatar('$authorAvatar');

    hook.send("$get[message]");
]

$deletecommand

$wait[200ms]

$setChannelVar[webhook_id;$splitText[1]]
$setChannelVar[webhook_token;$splitText[2]]

$textSplit[$createWebhook[$channelID;CRBT Webhook;;yes;###];###]

$else

$djsEval[
    const url = "https://discord.com/api/webhooks/$getChannelVar[webhook_id]/$getChannelVar[webhook_token]"
    const { Webhook } = require('discord-webhook-node');
    const hook = new Webhook(url);

    hook.setUsername("$nickname");
    hook.setAvatar('$authorAvatar');

    hook.send("$get[message]");
]

$deletecommand

$endif

$if[$message!=]
$let[message;$replaceText[$replaceText[$replaceText[$replaceText[$message;@everyone;@‎everyone];@here;@‎here];";'];\n;\\n] ( ͡° ͜ʖ ͡°)]
$else
$let[message;( ͡° ͜ʖ ͡°)]
$endif

$onlyIf[$hasPermsInChannel[$channelID;$clientID;managewebhooks]$hasPermsInChannel[$channelID;$clientID;managemessages]==truetrue;{execute:botPerms}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
    `}