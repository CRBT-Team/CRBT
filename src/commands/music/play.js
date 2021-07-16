const { emojis, tokens } = require("../../../index");

module.exports.command = {
    name: "play",
    module: "music",
    aliases: ["p", "add"],
    description_enUS: "Adds <botname> to the voice channel, adds the song(s) to the queue or directly plays it if no music is currently playing.",
    usage_enUS: "<search terms | YouTube, Spotify or SoundCloud URL>",
    botPerms: ["connect", "speak", "addreactions"],
    code: `
$if[$voiceID[$clientID]!=$voiceID]

    $reactionCollector[$get[id];everyone;1h;${emojis.music.skip},${emojis.general.information},${emojis.music.mute},${emojis.music.stop};skip,nowplaying,mute,stop;yes]

    $if[$replaceText[$replaceText[$checkContains[$checkContains[$message;youtube.com/playlist?list=]$checkContains[$message;open.spotify.com/playlist];true];true;yes];false;no]==no]
    
        $editMessage[$get[id];
        {author:$get[step3-$getGlobalUserVar[language]]:https://cdn.discordapp.com/attachments/843148633687588945/862975214794965012/list_success.png}
        {title:$songInfo[title;$get[queueLength]]}
        {url:$songInfo[url;$get[queueLength]]}
{description:
$get[duration-$getGlobalUserVar[language]] \`$replaceText[$get[duration];00:00:00;🔴 LIVE]\`
$get[playing-$getGlobalUserVar[language]]
}
    
{field:$get[uploaded-$getGlobalUserVar[language]]:
**[$songInfo[publisher;$get[queueLength]]]($songInfo[url;$get[queueLength]])**
:yes}
{field:$get[added-$getGlobalUserVar[language]]:
<@!$songInfo[userID;$get[queueLength]]>
:yes}
{field:$get[volume-$getGlobalUserVar[language]]:
$math[$getServerVar[volume]*2]% ($get[volumeTip-$getGlobalUserVar[language]])
:no}
{thumbnail:$songInfo[thumbnail;$get[queueLength]]}
{color:$getGlobalUserVar[color]}
;$channelID]
    
        $let[duration;$replaceText[$replaceText[$splitText[3];(;];);]$textSplit[$songInfo[duration;$get[queueLength]]; ]]
        $let[queueLength;$sub[$queueLength;1]]
    
    $else
    
        $editMessage[$get[id];
        {title:Added the playlist to the queue.}
        {color:$getGlobalUserVar[color]}
        ;$channelID]
    
        $let[newQueueLength;$queueLength]
    
    $endif
    
    $wait[$get[delay]]

    $let[queueLength;$sub[$queueLength;1]]

    $if[$checkContains[$message;soundcloud.com]==true]
        $let[delay;1000ms]
        $let[songName;$playSoundCloud[$replaceText[$replaceText[$message;<;];>;];${tokens.soundcloud};0s;yes;yes;{execute:addQueue}]]
    $elseIf[$checkContains[$message;open.spotify.com]==true]
        $let[delay;2500ms]
        $let[songName;$playSpotify[$replaceText[$replaceText[$message;<;];>;];name;yes;{execute:addQueue}]]
        $endelseIf
    $elseIf[$checkContains[$message;http:]$checkContains[$message;youtu]==truetrue]
    $let[delay;250ms]
        $let[songName;$playSong[$replaceText[$replaceText[$message;<;];>;];0s;yes;yes;{execute:addQueue}]]
        $endelseIf
    $else
        $let[delay;250ms]
        $let[songName;$playSong[$message;0s;yes;yes;{execute:addQueue}]]
    $endif

    $editMessage[$get[id];
    {title:$get[message]}
    {color:$getGlobalUserVar[color]}
    ;$channelID]

    $if[$checkContains[$checkContains[$message;youtube.com/playlist?list=]$checkContains[$message;open.spotify.com/playlist];true]==true]
        $let[message;$get[list-$getGlobalUserVar[language]]]
    $else
        $let[message;$get[step2-$getGlobalUserVar[language]]]
    $endif

    $wait[600ms]

    $setServerVar[music_channel;$channelID]

    $editMessage[$get[id];
    {title:$get[step1Title-$getGlobalUserVar[language]]}
    {description:$get[step1-$getGlobalUserVar[language]]}
    {color:$getGlobalUserVar[color]}
    ;$channelID]

    $joinVC[$voiceID]

    $wait[250ms]

    $let[id;$botLastMessageID]

    $reply[$messageID;
    {title:$get[title-$getGlobalUserVar[language]]}
    {color:$getGlobalUserVar[color]}
    ;no]

$else

    $reactionCollector[$get[id];everyone;1h;${emojis.music.skip},${emojis.general.information},${emojis.music.mute},${emojis.music.stop};skip,nowplaying,mute,stop;yes]

    $if[$replaceText[$replaceText[$checkContains[$checkContains[$message;youtube.com/playlist?list=]$checkContains[$message;open.spotify.com/playlist];true];true;yes];false;no]==no]
    
        $editMessage[$get[id];
{author:$get[step3-$getGlobalUserVar[language]]:https://cdn.discordapp.com/attachments/843148633687588945/862975214794965012/list_success.png}
{title:$songInfo[title;$get[queueLength]]}
{url:$songInfo[url;$get[queueLength]]}
{description:
$get[duration-$getGlobalUserVar[language]] \`$replaceText[$get[duration];00:00:00;🔴 LIVE]\`
$get[playing-$getGlobalUserVar[language]]
}
    
{field:$get[uploaded-$getGlobalUserVar[language]]:
**[$songInfo[publisher;$get[queueLength]]]($songInfo[url;$get[queueLength]])**
:yes}
{field:$get[added-$getGlobalUserVar[language]]:
<@!$songInfo[userID;$get[queueLength]]>
:yes}
{field:$get[volume-$getGlobalUserVar[language]]:
$math[$getServerVar[volume]*2]% ($get[volumeTip-$getGlobalUserVar[language]])
:no}
{thumbnail:$songInfo[thumbnail;$get[queueLength]]}
{color:$getGlobalUserVar[color]}
;$channelID]
    
        $let[duration;$replaceText[$replaceText[$splitText[3];(;];);]$textSplit[$songInfo[duration;$get[queueLength]]; ]]
        $let[queueLength;$sub[$queueLength;1]]
    
    $else
    
        $editMessage[$get[id];
        {title:Added the playlist to the queue.}
        {color:$getGlobalUserVar[color]}
        ;$channelID]
    
        $let[newQueueLength;$queueLength]

    $endif
    
    $wait[$get[delay]]

    $let[queueLength;$sub[$queueLength;1]]

    $let[id;$botLastMessageID]

    $reply[$messageID;
    {title:$get[message]}
    {color:$getGlobalUserVar[color]}
    ;no]

    $if[$checkContains[$checkContains[$message;youtube.com/playlist?list=]$checkContains[$message;open.spotify.com/playlist];true]==true]
        $let[message;$get[list-$getGlobalUserVar[language]]]
    $else
        $let[message;$get[step2-$getGlobalUserVar[language]]]
    $endif

    $if[$checkContains[$message;soundcloud.com]==true]
        $let[delay;1000ms]
        $let[songName;$playSoundCloud[$replaceText[$replaceText[$message;<;];>;];${tokens.soundcloud};0s;yes;yes;{execute:addQueue}]]
    $elseIf[$checkContains[$message;open.spotify.com]==true]
        $let[delay;2000ms]
        $let[songName;$playSpotify[$replaceText[$replaceText[$message;<;];>;];name;yes;{execute:addQueue}]]
        $endelseIf
    $elseIf[$checkContains[$message;http:]$checkContains[$message;youtu]==truetrue]
    $let[delay;250ms]
        $let[songName;$playSong[$replaceText[$replaceText[$message;<;];>;];0s;yes;yes;{execute:addQueue}]]
        $endelseIf
    $else
        $let[delay;250ms]
        $let[songName;$playSong[$message;0s;yes;yes;{execute:addQueue}]]
    $endif

$endif

$let[oldQueueLength;$queueLength]
$let[title-enUS;Processing...]
$let[step1Title-enUS;Connected!]
$let[step1-enUS;Joined <#$voiceID> and bound to <#$channelID>]
$let[step2-enUS;Searching for \`$message\`...]
$let[list-enUS;Fetching playlist]
$let[step3-enUS;Added to queue]
$let[added-enUS;Added by]
$let[volume-enUS;Volume]
$let[uploaded-enUS;Uploader]
$let[duration-enUS;Duration:]
$let[playing-enUS;Playing in <#$voiceID> and bound to <#$channelID>.]
$let[volumeTip-enUS;\`$getServerVar[prefix]volume <new volume>\`]

$if[$getServerVar[music_channel]!=]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;addreactions]==true;{execute:botPerms}]
$onlyIf[$hasPermsInChannel[$voiceID;$clientID;connect;speak]==true;{execute:botPerms}]
$onlyIf[$getServerVar[music_channel]==$channelID;{execute:wrongChannel}]
$onlyIf[$voiceID==$voiceID[$clientID];{execute:samevoice}]
$endif

$onlyIf[$voiceID!=;{execute:novoice}]
$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}