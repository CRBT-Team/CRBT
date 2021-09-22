const { emojis, colors, illustrations } = require("../../../index");

module.exports.command = {
    name: "loop",
    module: "music",
    description_enUS: "Loops the queue by default, but specifying \"song\" will loop the currently playing song.",
    usage_enUS: ["<song | queue>"],
    code: `
$if[$message==]

    $reply[$messageID;
    {author:$get[title-$getGlobalUserVar[language]]:$get[icon]}
    {color:${colors.success}}
    ;no]

    $let[title-enUS;Queue $replaceText[$replaceText[$get[state];true;looped];false;unlooped]!]
    $let[icon;$replaceText[$replaceText[$get[state];true;${illustrations.music.loop_true}];false;${illustrations.music.loop_false}]]

    $let[state;$loopQueue]

$elseIf[$toLowercase[$message]==song]

    $reply[$messageID;
    {author:$get[title-$getGlobalUserVar[language]]:$get[icon]}
    {color:${colors.success}}
    ;no]

    $let[title-enUS;Song $replaceText[$replaceText[$get[state];true;looped];false;unlooped]!]
    $let[icon;$replaceText[$replaceText[$get[state];true;${illustrations.music.loop_true}];false;${illustrations.music.loop_false}]]

    $let[state;$loopSong]

$endelseIf
$elseIf[$toLowercase[$message]==queue]

    $reply[$messageID;
    {author:$get[title-$getGlobalUserVar[language]]:$get[icon]}
    {color:${colors.success}}
    ;no]

    $let[title-enUS;Queue $replaceText[$replaceText[$get[state];true;looped];false;unlooped]!]
    $let[icon;$replaceText[$replaceText[$get[state];true;${illustrations.music.loop_true}];false;${illustrations.music.loop_false}]]

    $let[state;$loopQueue]

$endelseIf
$else

    $loop[1;args]

$endif

$onlyIf[$getServerVar[music_channel]==$channelID;{execute:wrongChannel}]
$onlyIf[$queueLength!=0;{execute:nomusic}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]

$onlyIf[1==2;{execute:musicDisabled}]
    `}