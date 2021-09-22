const { colors, emojis } = require("../../../index");

module.exports.command = {
    name: "join",
    module: "music",
    aliases: ["connect", "plscome"],
    description_enUS: "Connects <botname> to your voice channel.",
    code: `
$joinVC[$voiceID]

$setServerVar[music_channel;$channelID]

$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]}
{description:$get[desc-$getGlobalUserVar[language]]}

{color:${colors.success}}
;no]

$let[title-enUS;$randomText[Hey hey hey!;Yooo!;How's it going?!;Up to some tunes?] 👋]
$let[desc-enUS;Joined <#$voiceID> and bounded to <#$channelID>. 
Type \`$getServerVar[prefix]play $commandInfo[play;usage_enUS]\` to start the music!]

$if[$voiceID[$clientID]!=]
    $onlyIf[$voiceID[$clientID]==$voiceID;{execute:samevoice}]
$endif

$onlyIf[$voiceID!=;{execute:novoice}]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]

$onlyIf[1==2;{execute:musicDisabled}]
    `}