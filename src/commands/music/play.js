const { emojis, colors, tokens, illustrations } = require("../../../index");

module.exports.command = {
    name: "play",
    module: "music",
    aliases: ["p", "add"],
    description_enUS: "Adds <botname> to the voice channel, adds the song(s) to the queue or directly plays it if no music is currently playing.",
    usage_enUS: "<search terms | YouTube, Spotify or SoundCloud URL>",
    botPerms: ["connect", "speak", "addreactions"],
    examples_enUS: [
        "play Bohemian Rhapsody",
        "add https://youtu.be/5qap5aO4i9A",
        "p https://open.spotify.com/track/2V4Fx72svQRxrFvNT1eq5f?si=3a498c6c1259480c",
        "play https://soundcloud.com/djmaxeofficial/teamwork-promotional-single"
    ],
    cooldown: "3s",
    code: `
$if[$voiceID[$clientID]!=$voiceID]

    $reactionCollector[$get[id];everyone;1h;${emojis.music.skip},${emojis.information},${emojis.music.mute},${emojis.music.stop};skip,nowplaying,mute1,stop;yes]

    $if[$replaceText[$replaceText[$checkContains[$checkContains[$message;youtube.com/playlist?list=]$checkContains[$message;open.spotify.com/playlist];true];true;yes];false;no]==no]
    
        $editMessage[$get[id];
        {author:$get[step3-$getGlobalUserVar[language]]:${illustrations.music.queueadded}}
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
$replaceText[$replaceText[$checkContains[$getServerVar[volume];-muted];false;$math[$replaceText[$getServerVar[volume];-muted;]*2]%];true;${emojis.music.mute} Muted] ($get[volumeTip-$getGlobalUserVar[language]])
:no}
{thumbnail:$songInfo[thumbnail;$get[queueLength]]}
{color:${colors.success}}
;$channelID]
    
        $let[duration;$replaceText[$replaceText[$splitText[3];(;];);]$textSplit[$songInfo[duration;$get[queueLength]]; ]]
        $let[queueLength;$sub[$queueLength;1]]
    
    $else
    
        $editMessage[$get[id];
        {title:Added playlist to queue.}
        {color:${colors.success}}
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
    $let[delay;350ms]
        $let[songName;$playSong[$replaceText[$replaceText[$message;<;];>;];0s;yes;yes;{execute:addQueue}]]
        $endelseIf
    $else
        $let[delay;350ms]
        $let[songName;$playSong[$message;0s;yes;yes;{execute:addQueue}]]
    $endif

    $editMessage[$get[id];
    {title:$get[message]}
    {color:${colors.orange}}
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
    {color:${colors.success}}
    ;$channelID]

    $joinVC[$voiceID]

    $wait[350ms]

    $let[id;$botLastMessageID]

    $reply[$messageID;
    {author:$get[title-$getGlobalUserVar[language]]}
    {color:${colors.orange}}
    ;no]

$else

    $reactionCollector[$get[id];everyone;1h;${emojis.music.skip},${emojis.information},${emojis.music.mute},${emojis.music.stop};skip,nowplaying,mute1,stop;yes]

    $if[$replaceText[$replaceText[$checkContains[$checkContains[$message;youtube.com/playlist?list=]$checkContains[$message;open.spotify.com/playlist];true];true;yes];false;no]==no]
    
        $editMessage[$get[id];
{author:$get[step3-$getGlobalUserVar[language]]:${illustrations.music.queueadded}}
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
$replaceText[$replaceText[$checkContains[$getServerVar[volume];-muted];false;$math[$replaceText[$getServerVar[volume];-muted;]*2]%];true;${emojis.music.mute} Muted] ($get[volumeTip-$getGlobalUserVar[language]])
:no}
{thumbnail:$songInfo[thumbnail;$get[queueLength]]}
{color:${colors.success}}
;$channelID]
    
        $let[duration;$replaceText[$replaceText[$splitText[3];(;];);]$textSplit[$songInfo[duration;$get[queueLength]]; ]]
        $let[queueLength;$sub[$queueLength;1]]
    
    $else
    
        $editMessage[$get[id];
        {author:Added playlist to queue:${illustrations.music.queueadded}}
        {color:${colors.success}}
        ;$channelID]
    
        $let[newQueueLength;$queueLength]

    $endif
    
    $wait[$get[delay]]

    $let[queueLength;$sub[$queueLength;1]]

    $let[id;$botLastMessageID]

    $reply[$messageID;
    {author:$get[message]}
    {color:${colors.orange}}
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
    $let[delay;350ms]
        $let[songName;$playSong[$replaceText[$replaceText[$message;<;];>;];0s;yes;yes;{execute:addQueue}]]
        $endelseIf
    $else
        $let[delay;350ms]
        $let[songName;$playSong[$message;0s;yes;yes;{execute:addQueue}]]
    $endif

$endif

$let[oldQueueLength;$queueLength]
$let[title-enUS;Processing...]
$let[step1Title-enUS;${emojis.success} Connected!]
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

$if[$voiceID[$clientID]!=]
    $onlyIf[$hasPermsInChannel[$channelID;$clientID;addreactions]==true;{execute:botPerms}]
    $onlyIf[$hasPermsInChannel[$voiceID;$clientID;connect;speak]==true;{execute:botPerms}]
    $onlyIf[$getServerVar[music_channel]==$channelID;{execute:wrongChannel}]
    $onlyIf[$voiceID==$voiceID[$clientID];{execute:samevoice}]
$endif

$globalCooldown[$commandInfo[$commandName;cooldown];{execute:cooldown}]
$onlyIf[$voiceID!=;{execute:novoice}]
$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}