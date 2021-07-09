const { emojis, colors } = require("../../../index");

module.exports.awaitedCommand = {
    name: "stop",
    code: `
$stopSong
$setServerVar[music_channel;$getVar[music_channel]]
$editMessage[$message[1];
{title:$get[title-$getGlobalUserVar[language]]}
{description:
$get[description-$getGlobalUserVar[language]]
}
{color:${colors.red}}
;$channelID]

$let[current;$replaceText[$replaceText[$splitText[3];(;];);]$textSplit[$songInfo[current_duration]; ]]
$let[total;$replaceText[$replaceText[$splitText[3];(;];);]$textSplit[$songInfo[duration]; ]]

$let[title-enUS;${emojis.music.stop} Stopped playback]
$let[description-enUS;Music playback was stopped by <@!$authorID> on this server.]

$onlyIf[$voiceID[$clientID]==$voiceID;]
$onlyIf[$queueLength!=0;]
$onlyIf[$voiceID[$clientID]!=;]
    `}