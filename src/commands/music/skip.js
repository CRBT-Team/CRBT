const { emojis, illustrations, colors } = require("../../../index");

module.exports.command = {
    name: "skip",
    module: "music",
    aliases: ["s", "fs", "skipto", "st"],
    description_enUS: "Skips to the next song or to a specified queued song.",
    usage_enUS: "<queued song number (optional)>",
    code: `
$if[$message==]

$skipSong

    $reply[$messageID;
    {author:$get[title-$getGlobalUserVar[language]]:${illustrations.music.skip}}

    {color:${colors.success}}
    ;no]

$else

$skipTo[$message[1]]

    $reply[$messageID;
    {author:$get[title-$getGlobalUserVar[language]]:${illustrations.music.skip}}

    {description:
    $get[desc2-$getGlobalUserVar[language]] [$queue[$math[$message+1];1;{title}]]($queue[$math[$message+1];1;{url}])
    }

    {color:${colors.success}}
    ;no]

$onlyIf[$message<=$queueLength;{execute:unknownSong}]

$onlyIf[$isNumber[$message]==true;{execute:args}]

$endif

$let[desc2-enUS;Skipped to song #$message:]
$let[title-enUS;Skipped song]

$argsCheck[<1;{execute:args}]
$onlyIf[$getServerVar[music_channel]==$channelID;{execute:wrongChannel}]
$onlyIf[$voiceID==$voiceID[$clientID];{execute:samevoice}]
$onlyIf[$voiceID[$clientID]!=;{execute:nomusic}]
$onlyIf[$voiceID!=;{execute:novoice}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}

/*

        $skipSong

        $setServerVar[skip_votes;$getVar[skip_votes]]
        $setServerVar[skip_users;$getVar[skip_users]]

        $reply[$messageID;
        {author:$get[title-$getGlobalUserVar[language]]:${illustrations.music.skip}}

        {description:
        $get[desc-$getGlobalUserVar[language]] [$songInfo[title]]($songInfo[url])
        }

        {color:${colors.success}}
        ;no]

        $reply[$messageID;
        {author:$get[title2-$getGlobalUserVar[language]]:${illustrations.music.skip}}

        {description:
        $get[desc3-$getGlobalUserVar[language]]
        }

        {color:${colors.success}}
        ;no]

        $let[desc3-enUS;$replaceText[$replaceText[ $getServerVar[skip_users];  ;]; ;, ] want$replaceText[$replaceText[$checkCondition[$math[$round[$math[($getTextSplitLength-1)/2]]-$getServerVar[skip_votes]]==1];true;];false;s] to skip this song. Only $math[$round[$math[($getTextSplitLength-1)/2]]-($getServerVar[skip_votes]-1)] vote$replaceText[$replaceText[$checkCondition[$math[$round[$math[($getTextSplitLength-1)/2]]-($getServerVar[skip_votes]-1)]==1];true;];false;s] left to skip! Type \`$getServerVar[prefix]skip\` to skip-vote.]
        $let[title2-enUS;Should we skip?]

    $onlyIf[$getServerVar[skip_votes]==$round[$math[($getTextSplitLength-1)/2]];skip thing works]

    $setServerVar[skip_users;$getServerVar[skip_users] <@!$authorID>]
    $setServerVar[skip_votes;$math[$getServerVar[skip_votes]+1]]

    $onlyIf[$checkContains[$getServerVar[skip_users];<@!$authorID>]==false;you already voted lol]

    $textSplit[$usersInChannel[$voiceID[$clientID];id;@];@]

*/