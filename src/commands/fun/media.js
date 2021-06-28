const e = "\\"

module.exports.command = {
    name: "m/",
    nonPrefixed: true,
    module: "fun",
    aliases: ["scream", "aaaaaaaaa"],
    description_enUS: "Gives the clembs/media URL.",
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
    
    hook.send("$get[message]");
    ]

    $if[$getChannelVar[webhook_id]$getChannelVar[webhook_token]==]

        $setChannelVar[webhook_id;$splitText[1]]
        $setChannelVar[webhook_token;$splitText[2]]

        $textSplit[$createWebhook[$channelID;CRBT Webhook;;yes;###];###]

    $endif

$else

    $reply[$messageID;
    {title:$get[message]}
    {color:$getGlobalUserVar[color]}
    ;no]

$endif

$let[message;https://clembs.xyz/media/$replaceText[$replaceText[$message; ;-];";]]

$onlyIf[$checkContains[$stringEndsWith[$message;.png]$stringEndsWith[$message;.gif]$stringEndsWith[$message;.mp4]$stringEndsWith[$message;.wav];true]==true;]

$argsCheck[>1;]
$onlyIf[$getGlobalUserVar[blocklisted]==false;]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;]
$if[$guildID!=]$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;]$endif
$setGlobalUserVar[lastCmd;$commandName]
    `}
//    $createObject[{"message": "**$toUppercase[$replaceText[$replaceText[$message;";];${e};]]!!!**"}]
    