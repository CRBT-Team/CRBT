const { colors, emojis } = require("../../../index");

module.exports.command = {
    name: "addemoji",
    module: "settings",
    description_enUS: "Adds the specified emoji or image to the current server's emoji list.",
    usage_enUS: "<name> <image URL | attachment> | <custom emoji>",
    userPerms: ["manageemojis"],
    botPerms: ["manageemojis"],
    code: `
$if[$checkContains[$message[1];<]$checkContains[$message[1];>]$checkContains[$message[1];:]$checkCondition[$charCount[$message[1]]>=24]==falsefalsefalsefalse]

    $reply[$messageID;
    {title:$get[title-$getGlobalUserVar[language]]}
    {description:$addEmoji[$get[url];$get[name];yes]}
    {color:${colors.success}}
    ;no]

    $onlyIf[$emojiCount[$replaceText[$replaceText[$checkContains[$splitText[2]==.gif];true;animated];false;normal]]<$replaceText[$replaceText[$replaceText[$replaceText[$serverBoostLevel;0;50];1;100];2;150];3;250];{execute:emojiMaxCap}]

    $let[url;http$splitText[2]]
    $let[name;$replaceText[$replaceText[$toLowercase[$splitText[1]]; ;_];-;_]]

    $onlyIf[$isValidLink[http$splitText[2]]==true;{execute:args}]
    $onlyIf[$splitText[2]!=;{execute:args}]

    $textSplit[$replaceText[$message$messageAttachment; http;http];http]

$else

    $reply[$messageID;
    {title:$get[title-$getGlobalUserVar[language]]}
    {description:$addEmoji[$get[url];$splitText[2];yes]}
    ;no]

    $onlyIf[$emojiCount[$replaceText[$replaceText[$get[animated];true;animated];false;normal]]<$replaceText[$replaceText[$replaceText[$replaceText[$serverBoostLevel;0;50];1;100];2;150];3;250];{execute:emojiMaxCap}]

    $let[url;https://cdn.discordapp.com/emojis/$get[id].$replaceText[$replaceText[$get[animated];false;png];true;gif]]
    $let[animated;$checkCondition[$splitText[1]==<a]]
    $let[id;$replaceText[$splitText[3];>;]]

    $textSplit[$replaceText[$message[1];#COLON#;@];@]

    $onlyIf[$checkContains[$message[1];<]$checkContains[$message[1];>]$checkContains[$message[1];:]$checkCondition[$charCount[$message[1]]>=24]==truetruetruetrue;{execute:args}]
$endif

$let[message;$replaceText[$replaceText[$checkCondition[$message[2]==];false;$message[2]];true;$messageAttachment]]
    
$let[title-enUS;${emojis.success} Emoji added to $serverName!]

$onlyBotPerms[manageemojis;{execute:botPerms}]
$onlyPerms[manageemojis;{execute:userPerms}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}

/*
    $let[two;$replaceText[$replaceText[$isValidImageLink[$get[msg1]];true;$get[msg2]];false;$get[msg1]]]
    $let[one;$replaceText[$replaceText[$isValidImageLink[$get[msg1]];true;$get[msg1]];false;$get[msg2]]]
    
    $let[msg1;$message[1]]
    $let[msg2;$message[2]]
*/