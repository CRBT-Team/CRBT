const { colors, emojis, tokens } = require("../../index");

module.exports.command = {
  name: "play",
  module: "music",
  aliases: ["p", "add"],
  description_enUS: "Adds <botname> to the voice channel, adds the song(s) to the queue or directly plays it if no music is currently playing.",
  usage_enUS: "<search keywords or YouTube, Spotify or SoundCloud URL>",
  botperms: ["connect", "speak"],
  code: `
$reactionCollector[$get[id];everyone;1h;${emojis.music.skip},${emojis.music.stop},${emojis.general.information},${emojis.music.mute};skip,stop,nowplaying,mute;yes]

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
(Use \`$getServerVar[prefix]volume\` to change it or click on ${emojis.music.mute} to mute/unmute.)
:no}
{thumbnail:$songInfo[thumbnail;$get[queueLength]]}
{color:$getGlobalUserVar[color]}
;$channelID]

$let[queueLength;$sub[$queueLength;1]]

$wait[250ms]

$editMessage[$get[id];
{title:$get[message]}
{color:$getGlobalUserVar[color]}
;$channelID]

$if[$checkContains[$checkContains[$message;youtube.com/playlist?list=]$checkContains[$message;open.spotify.com/playlist];true]==true]
  $let[message;$get[list-$getGlobalUserVar[language]]]
$else
  $let[message;$get[step2-$getGlobalUserVar[language]]]
$endif

$if[$checkContains[$message;soundcloud.com]==true]
  $let[songName;$playSoundCloud[$replaceText[$replaceText[$message;<http;http];>;];${tokens.soundcloud.clientID};5m;yes;yes;{title:${emojis.general.error} An error occured while adding \`$message\` to the queue!} {color:${colors.red}}]]
$elseIf[$checkContains[$message;open.spotify.com]==true]
  $let[songName;$playSpotify[$replaceText[$replaceText[$message;<http;http];>;];name;yes;{title:${emojis.general.error} An error occured while adding \`$message\` to the queue!} {color:${colors.red}}]]
  $endelseIf
$elseIf[$checkContains[$message;http:]$checkContains[$message;youtu]==truetrue]
  $let[songName;$playSong[$replaceText[$replaceText[$message;<http;http];>;];5m;yes;yes;{title:${emojis.general.error} An error occured while adding \`$message\` to the queue!} {color:${colors.red}}]]
  $endelseIf
$else
  $let[songName;$playSong[$message;5m;yes;yes;{title:${emojis.general.error} An error occured while adding \`$message\` to the queue!} {color:${colors.red}}]]
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

$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
  `}