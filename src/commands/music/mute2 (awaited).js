const { colors, emojis, illustrations } = require("../../../index");

module.exports.awaitedCommand = {
    name: "mute2",
    code: `
$editMessage[$message[1];
{author:Volume is set at 0%:$get[icon]}
{description:
You can use the reactions below this message to control the volume or use \`$getServerVar[prefix]volume <number>\` to manually change it.
}
{color:$getGlobalUserVar[color]}
;$channelID]

$let[icon;${illustrations.music.volumemuted}]
    
$if[$queueLength!=0]
    $volume[0]
$endif
$setServerVar[volume;0]

$if[$voiceID[$clientID]!=]
    $onlyIf[$voiceID[$clientID]==$voiceID;]
    $onlyIf[$queueLength!=0;]
    $onlyIf[$voiceID[$clientID]!=;]
$endif
    `}