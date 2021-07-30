const emojis = require("../../../data/misc/emoji-database.json")

module.exports.command = {
    name: "emojiinfo",
    aliases: ["emoji", "ei", "emote", "emoteinfo", "emoji-info", "emoji_info", "emote-info", "emote_info"],
    module: "info",
    description_enUS: "Outputs information about a specified emoji",
    usage_enUS: "<custom emoji | standard Unicode emoji>",
    examples_enUS: [
        "emojiinfo good_meal",
        "ei 😎",
        "emote <:partner:866113174314287125>"
    ],
    code: `
$if[$checkContains[${emojis};$message[1]]==true]

    $reply[$messageID;
    {author:$get[title-$getGlobalUserVar[language]]:$get[twitter]}
    {description:
    **[$get[emojipedia-$getGlobalUserVar[language]]](https://emojipedia.org/$message[1])**
    }
    {field:$get[types-$getGlobalUserVar[language]]:
    **[Twitter]($get[twitter])** | **[Google]($get[google])** | **[Apple]($get[apple])** | **[Facebook]($get[facebook])**
    :no}
    {field:$get[unicode-$getGlobalUserVar[language]]:
    $get[code2]
    :yes}
    {color:$getGlobalUserVar[color]}
    {image:$get[twitter]}
    ;no]

    $let[google;https://raw.githubusercontent.com/iamcal/emoji-data/master/img-google-136/$get[code].png]
    $let[twitter;https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/$get[code].png]
    $let[apple;https://raw.githubusercontent.com/iamcal/emoji-data/master/img-apple-160/$get[code].png]
    $let[facebook;https://raw.githubusercontent.com/iamcal/emoji-data/master/img-facebook-96/$get[code].png]
    
    $let[types-enUS;Types]
    $let[title-enUS;$message[1] - Emoji info]
    $let[unicode-enUS;Unicode]
    $let[emojipedia-enUS;Emojipedia page]
    
    $let[code2;$getObjectProperty[unicode]]
    $let[code;$replaceText[$getObjectProperty[unicode]; ;-]]
    
    $djsEval[
    const message = "$get[message]";
    const unicode = require("emoji-unicode");
    d.object.unicode = unicode(message);
    ]
    
    $let[message;$replaceText[$replaceText[$message;\n;\\n];";']]
    
$elseIf[$charCount[$message[1]]>=24]

    $reply[$messageID;
    {author:$get[title-$getGlobalUserVar[language]]:$get[url]}

    {field:$get[resolutions-$getGlobalUserVar[language]]:
    **[1024]($get[url]?size=1024)** | **[512]($get[url]?size=512)** | **[256]($get[url]?size=256)** | **[128]($get[url]?size=128)**
    :no}

    {field:$get[id-$getGlobalUserVar[language]]:$get[id]:no}
    
    {field:$get[animated-$getGlobalUserVar[language]]:yes}

    {field:$get[origin-$getGlobalUserVar[language]]:yes}
    {field:$get[creationDate-$getGlobalUserVar[language]]:no}
    $let[creationDate-enUS;Added:<t:$formatDate[$getObjectProperty[time];X]> (<t:$formatDate[$getObjectProperty[time];X]:R>)]
    $djsEval[const snowflake = require('discord-snowflake'); d.object.time = snowflake("$get[id]");]

    {image:$get[url]}

    {color:$getGlobalUserVar[color]}

    ;no]

    $let[title-enUS;$splitText[2] - Emoji info]
    $let[resolutions-enUS;Resolutions (in pixels)]
    $let[id-enUS;ID]
    $let[animated-enUS;Animated:$replaceText[$replaceText[$get[animated];true;Yes];false;No]]
    $let[origin-enUS;From this server:$replaceText[$replaceText[$checkContains[$serverEmojis;$message];true;Yes];false;No]]

    $let[url;https://cdn.discordapp.com/emojis/$get[id].$replaceText[$replaceText[$get[animated];false;png];true;gif]]
    $let[animated;$checkCondition[$splitText[1]==<a]]
    $let[id;$replaceText[$splitText[3];>;]]

    $textSplit[$replaceText[$message[1];#COLON#;@];@]

    $onlyIf[$checkContains[$message[1];<]$checkContains[$message[1];>]$checkContains[$message[1];:]==truetruetrue;{execute:args}]

$endelseIf
$else

    $reply[$messageID;
    {author:$get[title-$getGlobalUserVar[language]]:$get[url]}

    {field:$get[resolutions-$getGlobalUserVar[language]]:
    **[1024]($get[url]?size=1024)** | **[512]($get[url]?size=512)** | **[256]($get[url]?size=256)** | **[128]($get[url]?size=128)**
    :no}

    {field:$get[id-$getGlobalUserVar[language]]:$get[id]:no}
    
    {field:$get[animated-$getGlobalUserVar[language]]:yes}

    {field:$get[origin-$getGlobalUserVar[language]]:yes}
    {field:$get[creationDate-$getGlobalUserVar[language]]:no}
    $let[creationDate-enUS;Added:<t:$formatDate[$getObjectProperty[time];X]> (<t:$formatDate[$getObjectProperty[time];X]:R>)]
    $djsEval[const snowflake = require('discord-snowflake'); d.object.time = snowflake("$get[id]");]

    {image:$get[url]}

    {color:$getGlobalUserVar[color]}

    ;no]

    $let[title-enUS;$splitText[2] - Emoji info]
    $let[resolutions-enUS;Resolutions (in pixels)]
    $let[id-enUS;ID]
    $let[animated-enUS;Animated:$replaceText[$replaceText[$get[animated];true;Yes];false;No]]
    $let[origin-enUS;From this server:$replaceText[$replaceText[$checkContains[$serverEmojis;$message];true;Yes];false;No]]

    $let[url;https://cdn.discordapp.com/emojis/$get[id].$replaceText[$replaceText[$get[animated];false;png];true;gif]]
    $let[animated;$checkCondition[$splitText[1]==<a]]
    $let[id;$replaceText[$splitText[3];>;]]

    $textSplit[$replaceText[$get[emoji];#COLON#;@];@]

    $onlyIf[$get[emoji]!=undefined;{execute:queryNotFound}]

    $let[emoji;$customEmoji[$replaceText[$message[1];#COLON#;]]]

$endif

$argsCheck[1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}