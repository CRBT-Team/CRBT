module.exports.awaitedCommand = {
    name: "skip",
    code: `
$volume[$getServerVar[volume]]
$skipSong
$editMessage[$message[1];
{author:$get[title-$getGlobalUserVar[language]]:https://cdn.discordapp.com/emojis/836285755747336272.png}
{title:$songInfo[title]}
{url:$songInfo[url]}
{description:
$get[playing-$getGlobalUserVar[language]]
}
{field:$get[volume-$getGlobalUserVar[language]]:
$math[$getServerVar[volume]*2]% ($get[volumeTip-$getGlobalUserVar[language]])
:no}
{color:$getGlobalUserVar[color]}
;$channelID]

$let[current;$replaceText[$replaceText[$splitText[3];(;];);]$textSplit[$songInfo[current_duration]; ]]
$let[total;$replaceText[$replaceText[$splitText[3];(;];);]$textSplit[$songInfo[duration]; ]]

$let[title-enUS;Skipped song]
$let[volume-enUS;Volume]
$let[playing-enUS;<@!$authorID> skipped this song.
Playing in <#$voiceID[$clientID]> and bound to <#$getServerVar[music_channel]>.]
$let[volumeTip-enUS;\`$getServerVar[prefix]volume <new volume>\`]

$onlyIf[$voiceID[$clientID]==$voiceID;]
$onlyIf[$queueLength!=0;]
$onlyIf[$voiceID[$clientID]!=;]
    `}