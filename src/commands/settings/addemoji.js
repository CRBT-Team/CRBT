const { colors, emojis } = require("../../../index");

module.exports.command = {
    name: "addemoji",
    userPerms: ["manageemojis"],
    botPerms: ["manageemojis"],
    module: "info",
    description_enUS: "If an emoji is used, it will that specified",
    usage_enUS: "<name> <image URL | attachment> | <custom emoji>",
    code: `
$if[$get[message]!=]

    $reply[$messageID;
    {title:$get[title-$getGlobalUserVar[language]]}
    {description:
        $addEmoji[$get[message];$message[1];yes]
    }
    {color:${colors.success}}
    ;no]

    $onlyIf[$isValidImageLink[$get[message]]==true;{execute:args}]

$else

    $reply[$messageID;
    {title:$get[title-$getGlobalUserVar[language]]}
    {description:$addEmoji[$get[url];$splitText[2];yes]}
    ;no]

    $let[url;https://cdn.discordapp.com/emojis/$get[id].$replaceText[$replaceText[$get[animated];false;png];true;gif]]
    $let[animated;$checkCondition[$splitText[1]==<a]]
    $let[id;$replaceText[$splitText[3];>;]]

    $textSplit[$replaceText[$message[1];#COLON#;@];@]

    $onlyIf[$checkContains[$message[1];<]$checkContains[$message[1];>]$checkContains[$message[1];:]$checkCondition[$charCount[$message[1]]>=24]==truetruetruetrue;{execute:args}]
$endif

$let[message;$replaceText[$replaceText[$checkCondition[$message[2]==];false;$message[2]];true;$messageAttachment]]
    
$let[title-enUS;${emojis.general.success} Emoji added to $serverName!]

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}

/*
    $let[two;$replaceText[$replaceText[$isValidImageLink[$get[msg1]];true;$get[msg2]];false;$get[msg1]]]
    $let[one;$replaceText[$replaceText[$isValidImageLink[$get[msg1]];true;$get[msg1]];false;$get[msg2]]]
    
    $let[msg1;$message[1]]
    $let[msg2;$message[2]]
*/