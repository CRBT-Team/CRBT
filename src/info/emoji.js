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

    $if[$get[animated]==true]
        {description:**[$get[openInBrowser-$getGlobalUserVar[language]]]($get[url])**}
    $else
        {field:$get[resolutions-$getGlobalUserVar[language]]:
        **[4096]($get[url]&size=4096)** | **[2048]($get[url]&size=2048)** | **[1024]($get[url]&size=1024)** | **[512]($get[url]&size=512)**
        :no}
    $endif

    {field:$get[id-$getGlobalUserVar[language]]:$get[id]:yes}
    {field:$get[animated-$getGlobalUserVar[language]]:yes}

    $if[$checkContains[$serverEmojis;$message]==true]
        {field:$get[creationDate-$getGlobalUserVar[language]]:yes}
        {field:$get[origin-$getGlobalUserVar[language]]:$serverName:yes}
    $else
        {field:$get[origin-$getGlobalUserVar[language]]:$serverName[$emoji[$get[id];guildid]]:yes}
    $endif

    {image:$get[url]}

    {color:$getGlobalUserVar[color]}

    ;no]

    $let[title-enUS;#COLON#$splitText[2]#COLON# - Information]
    $let[openInBrowser-enUS;Open in browser]
    $let[resolutions-enUS;Resolutions (in pixels)]
    $let[id-enUS;ID]
    $let[animated-enUS;Animated:$replaceText[$replaceText[$get[animated];true;Yes];false;No]
    $let[creationDate-enUS;Added:$get[format-enUS]]
    $let[format-enUS;$formatDate[$get[creationDate];YYYY]-$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$get[creationDate];MM]]==1];true;0$formatDate[$get[creationDate];MM]];false;$formatDate[$get[creationDate];MM]]-$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$get[creationDate];DD]]==1];true;0$formatDate[$get[creationDate];DD]];false;$formatDate[$get[creationDate];DD]] at $replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$get[creationDate];HH]]==1];true;0$formatDate[$get[creationDate];HH]];false;$formatDate[$get[creationDate];HH]]:$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$get[creationDate];mm]]==1];true;0$formatDate[$get[creationDate];mm]];false;$formatDate[$get[creationDate];mm]]]

    $let[creationDate;$emoji[$get[id];created]]
    $let[url;https://cdn.discordapp.com/emojis/$get[id].$replaceText[$replaceText[$get[animated];false;png];true;gif]]
    $let[animated;$checkCondition[$splitText[1]==<a]]
    $let[id;$replaceText[$splitText[3];>;]]

    $textSplit[$replaceText[$message;#COLON#;@];@]

    $onlyIf[$checkContains[$message[1];<]$checkContains[$message[1];>]$checkContains[$message[1];:]==truetruetrue;{execute:error_incorrectargs}]

$else

    no ($charCount[$message[1]])

$endif

$argsCheck[1;{execute:args}]

$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=] 
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] 
$endif
    `}