const emojis = require("../../../json/emoji-database.json")

module.exports.command = {
    name: "emojiinfo",
    aliases: ["emoji", "ei", "emote", "emoteinfo", "emoji-info", "emoji_info", "emote-info", "emote_info"],
    module: "info",
    description_enUS: "",
    usage_enUS: "<custom emoji | standard Unicode emoji>",
    code: `
$if[$charCount[$message[1]]>=24]

    $reply[$messageID;
    {author:$get[title-$getGlobalUserVar[language]]:$get[url]}

    {field:$get[resolutions-$getGlobalUserVar[language]]:
    **[1024]($get[url]?size=1024)** | **[512]($get[url]?size=512)** | **[256]($get[url]?size=256)** | **[128]($get[url]?size=128)**
    :no}

    {field:$get[id-$getGlobalUserVar[language]]
    :$get[id]
    :no}
    
    {field:$get[animated-$getGlobalUserVar[language]]
    :yes}

    $if[$checkContains[$serverEmojis;$message]==true]
        {field:$get[origin-$getGlobalUserVar[language]]:yes}
        {field:$get[creationDate-$getGlobalUserVar[language]]:no}
        
    $let[creationDate-enUS;Added:$get[format-enUS]]
    $let[format-enUS;$formatDate[$get[creationDate];YYYY]-$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$get[creationDate];MM]]==1];true;0$formatDate[$get[creationDate];MM]];false;$formatDate[$get[creationDate];MM]]-$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$get[creationDate];DD]]==1];true;0$formatDate[$get[creationDate];DD]];false;$formatDate[$get[creationDate];DD]] at $replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$get[creationDate];HH]]==1];true;0$formatDate[$get[creationDate];HH]];false;$formatDate[$get[creationDate];HH]]:$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$get[creationDate];mm]]==1];true;0$formatDate[$get[creationDate];mm]];false;$formatDate[$get[creationDate];mm]]]
    $let[creationDate;$emoji[$get[id];created]]
    $else
        {field:$get[origin-$getGlobalUserVar[language]]:yes}
    $endif

    {image:$get[url]}

    {color:$getGlobalUserVar[color]}

    ;no]

    $let[title-enUS;$splitText[2] - Information]
    $let[resolutions-enUS;Resolutions (in pixels)]
    $let[id-enUS;ID]
    $let[animated-enUS;Animated:$replaceText[$replaceText[$get[animated];true;Yes];false;No]]
    $let[origin-enUS;From this server:$replaceText[$replaceText[$checkContains[$serverEmojis;$message];true;Yes];false;No]]

    $let[url;https://cdn.discordapp.com/emojis/$get[id].$replaceText[$replaceText[$get[animated];false;png];true;gif]]
    $let[animated;$checkCondition[$splitText[1]==<a]]
    $let[id;$replaceText[$splitText[3];>;]]

    $textSplit[$replaceText[$message;#COLON#;@];@]

    $onlyIf[$checkContains[$message[1];<]$checkContains[$message[1];>]$checkContains[$message[1];:]==truetruetrue;{execute:error_incorrectargs}]

$else

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
$let[title-enUS;$message[1] - Information]
$let[unicode-enUS;Unicode]
$let[emojipedia-enUS;Emojipedia page]

$let[code2;$getObjectProperty[unicode]]
$let[code;$replaceText[$getObjectProperty[unicode]; ;-]]

$djsEval[
const message = "$getObjectProperty[message]";
const unicode = require("emoji-unicode");
d.object.unicode = unicode(message);
]

$createObject[{"message":"$message"}]

$onlyIf[$checkContains[${emojis};$message[1]]==true;{execute:args}]

$endif

$argsCheck[1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
    `}