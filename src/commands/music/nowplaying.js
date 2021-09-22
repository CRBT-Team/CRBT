const { emojis, illustrations } = require("../../../index");

module.exports.command = {
    name: "nowplaying",
    module: "music",
    aliases: ["np", "now-playing", "playing", "controls"],
    description_enUS: "Gives info on the currently playing title + shows the visual controls.",
    botPerms: "addreactions",
    cooldown: "15s",
    code: `
$reactionCollector[$botLastMessageID;everyone;1h;${emojis.music.skip},${emojis.information},${emojis.music.mute},${emojis.music.stop};skip,nowplaying,mute1,stop;yes]

$reply[$messageID;
{author:$get[nowplaying-$getGlobalUserVar[language]]:${illustrations.music.information}}
{title:$songInfo[title]}
{url:$songInfo[url]}
{description:
$get[duration-$getGlobalUserVar[language]] \`$replaceText[$get[current]/$get[total];/00:00:00; (🔴 LIVE)]\`
$get[playing-$getGlobalUserVar[language]]
}

{field:$get[uploaded-$getGlobalUserVar[language]]:
**[$songInfo[publisher]]($songInfo[url])**
:yes}
{field:$get[added-$getGlobalUserVar[language]]:
<@!$songInfo[userID]>
:yes}
{field:$get[volume-$getGlobalUserVar[language]]:
$replaceText[$replaceText[$checkContains[$getServerVar[volume];-muted];false;$math[$replaceText[$getServerVar[volume];-muted;]*2]%];true;${emojis.music.mute} Muted] ($get[volumeTip-$getGlobalUserVar[language]])
:no}
{thumbnail:$songInfo[thumbnail]}
{color:$getGlobalUserVar[color]}
;no]

$let[current;$replaceText[$replaceText[$splitText[3];(;];);]$textSplit[$songInfo[current_duration]; ]]
$let[total;$replaceText[$replaceText[$splitText[3];(;];);]$textSplit[$songInfo[duration]; ]]

$let[nowplaying-enUS;Currently playing]
$let[added-enUS;Added by]
$let[volume-enUS;Volume]
$let[uploaded-enUS;Uploader]
$let[duration-enUS;Duration:]
$let[playing-enUS;Playing in <#$voiceID[$clientID]> and bound to <#$getServerVar[music_channel]>.]
$let[volumeTip-enUS;\`$getServerVar[prefix]volume <new volume>\`]

$globalCooldown[$commandInfo[$commandName;cooldown];{execute:cooldown}]
$argsCheck[0;{execute:args}]
$onlyIf[$queueLength!=0;{execute:nomusic}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]

$onlyIf[1==2;{execute:musicDisabled}]
    `}