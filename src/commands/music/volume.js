const { emojis, colors, illustrations } = require("../../../index");

module.exports.command = {
    name: "volume",
    aliases: ["vol"],
    module: "music",
    description_enUS: "Changes the playback volume for the server, or returns volume information if no arguments are given.",
    usage_enUS: "<number>",
    code: `
$if[$message!=]

    $if[$queueLength!=0]
    $volume[$round[$math[$get[volume]/2]]]
    $endif

    $if[$replaceText[$message;%;]==100]
    $deleteServerVar[volume]
    $else
    $setServerVar[volume;$round[$math[$get[volume]/2]]]
    $endif

    $reply[$messageID;
    {author:Set volume to $round[$get[volume]]%:$replaceText[$get[icon];\n;]}
    {color:${colors.success}}
    ;no]

    $onlyIf[$round[$get[volume]]<=100;{execute:volumeLimits}]
    $onlyIf[$round[$get[volume]]>=0;{execute:volumeLimits}]
    $onlyIf[$isNumber[$get[volume]]==true;{execute:args}]
    
$if[$getServerVar[music_channel]$voiceID[$clientID]!=]
    $onlyIf[$getServerVar[music_channel]==$channelID;{execute:wrongChannel}]
    $onlyIf[$voiceID==$voiceID[$clientID];{execute:samevoice}]
    $onlyIf[$voiceID!=;{execute:novoice}]
$endif

    $let[icon;$replaceText[$replaceText[    
    $checkCondition[$get[volume]>=50]
    ;true;${illustrations.music.volumehigh}];false;
    $replaceText[$replaceText[
    $checkCondition[$get[volume]>0]
    ;true;${illustrations.music.volumelow}];false;${illustrations.music.volumemuted}
    ]]]

    $let[volume;$replaceText[$message;%;]]

$else

    $reactionCollector[$botLastMessageID;everyone;10m;${emojis.music.volume},${emojis.music.volume_low},${emojis.music.mute};full,low,mute2;yes]

    $reply[$messageID;
    {author:Volume is $replaceText[$replaceText[$checkContains[$getServerVar[volume];-muted];false;set at $math[$replaceText[$getServerVar[volume];-muted;]*2]%];true;muted]:$replaceText[$get[icon];\n;]}
    {description:
You can use the reactions below this message to control the volume or use \`$getServerVar[prefix]volume <number>\` to manually change it.
}
    {color:$getGlobalUserVar[color]}
    ;no]

    $let[icon;
    $replaceText[$replaceText[
    $checkContains[$getServerVar[volume];-muted]
    ;true;${illustrations.music.volumemuted}];false;
    $replaceText[$replaceText[    
    $checkCondition[$math[$replaceText[$getServerVar[volume];-muted;]*2]>=50]
    ;true;${illustrations.music.volumehigh}];false;
    $replaceText[$replaceText[
    $checkCondition[$math[$replaceText[$getServerVar[volume];-muted;]*2]>0]
    ;true;${illustrations.music.volumelow}];false;${illustrations.music.volumemuted}
    ]]]

$endif

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]

$onlyIf[1==2;{execute:musicDisabled}]
    `}