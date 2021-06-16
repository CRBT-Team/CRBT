const { colors, emojis, tokens } = require("../../index");

module.exports.command = {
    name: "play",
    module: "music",
    aliases: ["p", "add"],
    description_enUS: "Adds <botname> to the voice channel, adds the song(s) to the queue or directly plays it if no music is currently playing.",
    usage_enUS: "<search terms | YouTube, Spotify or SoundCloud URL>",
    botperms: ["connect", "speak"],
    code: `
$reactionCollector[$get[id];everyone;1h;${emojis.music.skip},${emojis.music.stop},${emojis.general.information},${emojis.music.mute};skip,stop,nowplaying,mute;yes]

$if[$checkContains[$checkContains[$message;youtube.com/playlist?list=]$checkContains[$message;open.spotify.com/playlist];true]!=true]

$editMessage[$get[id];
{author:$get[step3-$getGlobalUserVar[language]]:https://cdn.discordapp.com/emojis/836285755923365918.png}
{title:$songInfo[title;$get[queueLength]]}
{url:$songInfo[url;$get[queueLength]]}
{description:
$get[duration-$getGlobalUserVar[language]] \`$replaceText[$replaceText[$splitText[3];(;];);]$textSplit[$songInfo[duration;$get[queueLength]]; ]\`
$get[playing-$getGlobalUserVar[language]]
}

{field:$get[uploaded-$getGlobalUserVar[language]]:
[$songInfo[publisher;$get[queueLength]]]($songInfo[url;$get[queueLength]])
:yes}
{field:$get[added-$getGlobalUserVar[language]]:
<@!$songInfo[userID;$get[queueLength]]>
:yes}
{field:$get[volume-$getGlobalUserVar[language]]:
$getServerVar[volume]%
($get[volumeTip-$getGlobalUserVar[language]])
:no}
{thumbnail:$songInfo[thumbnail;$get[queueLength]]}
{color:$getGlobalUserVar[color]}
;$channelID]

$let[queueLength;$sub[$queueLength;1]]

$else

$editMessage[$get[id];
{title:Added $sub[$get[newQueueLength];$get[oldQueueLength]] songs to the queue.}
{color:$getGlobalUserVar[color]}
;$channelID]

$let[newQueueLength;$queueLength]

$endif

$wait[$get[delay]]

$if[$voiceID[$clientID]!=$voiceID]

  $editMessage[$get[id];
  {title:$get[message]}
  {color:$getGlobalUserVar[color]}
  ;$channelID]

  $if[$checkContains[$checkContains[$message;youtube.com/playlist?list=]$checkContains[$message;open.spotify.com/playlist];true]==true]
    $let[message;$get[list-$getGlobalUserVar[language]]]
  $else
    $let[message;$get[step2-$getGlobalUserVar[language]]]
  $endif

  $volume[$getServerVar[volume]]

  $if[$checkContains[$message;soundcloud.com]==true]
    $let[delay;500ms]
    $let[songName;$playSoundCloud[$replaceText[$replaceText[$message;<http;http];>;];${tokens.soundcloud.clientID};5m;yes;yes;{execute:addqueue}]]
  $elseIf[$checkContains[$message;open.spotify.com]==true]
    $let[delay;1500ms]
    $let[songName;$playSpotify[$replaceText[$replaceText[$message;<http;http];>;];name;yes;{execute:addqueue}]]
    $endelseIf
  $elseIf[$checkContains[$message;http:]$checkContains[$message;youtu]==truetrue]
  $let[delay;250ms]
    $let[songName;$playSong[$replaceText[$replaceText[$message;<http;http];>;];5m;yes;yes;{execute:addqueue}]]
    $endelseIf
  $else
    $let[delay;250ms]
    $let[songName;$playSong[$message;5m;yes;yes;{execute:addqueue}]]
  $endif

  $wait[250ms]

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
    $let[songName;$playSoundCloud[$replaceText[$replaceText[$message;<http;http];>;];${tokens.soundcloud.clientID};5m;yes;yes;{execute:addqueue}]]
  $elseIf[$checkContains[$message;open.spotify.com]==true]
    $let[delay;2000ms]
    $let[songName;$playSpotify[$replaceText[$replaceText[$message;<http;http];>;];name;yes;{execute:addqueue}]]
    $endelseIf
  $elseIf[$checkContains[$message;http:]$checkContains[$message;youtu]==truetrue]
  $let[delay;250ms]
    $let[songName;$playSong[$replaceText[$replaceText[$message;<http;http];>;];5m;yes;yes;{execute:addqueue}]]
    $endelseIf
  $else
    $let[delay;250ms]
    $let[songName;$playSong[$message;5m;yes;yes;{execute:addqueue}]]
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
$let[volumeTip-enUS;Use \`$getServerVar[prefix]volume\` to change it or click on ${emojis.music.mute} to mute/unmute.]

$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$endif
    `}