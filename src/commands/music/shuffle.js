const { emojis } = require("../../../index");

module.exports.command = {
    name: "shuffle",
    module: "music",
    aliases: ["s", "fs", "skipto", "st"],
    description_enUS: "Skips to the next song or to a specified queued song.",
    usage_enUS: "<queued song number (optional)>",
    code: `
$if[$message==]

$skipSong

$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]:https://cdn.discordapp.com/emojis/836285755747336272.png}

{description:
${emojis.music.skip} $get[desc-$getGlobalUserVar[language]] [$songInfo[title]]($songInfo[url])
}

{color:$getGlobalUserVar[color]}
;no]

$else

$skipTo[$message[1]]

$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]:https://cdn.discordapp.com/emojis/836285755747336272.png}

{description:
${emojis.music.skip} $get[desc2-$getGlobalUserVar[language]] [$queue[$message;1;{title}]]($queue[$message;1;{url}])
}

{color:$getGlobalUserVar[color]}
;no]

$onlyIf[$message<=$queueLength;{execute:unknownSong}]

$onlyIf[$isNumber[$message]==true;{execute:args}]

$endif

$let[desc2-enUS;Skipped to song #$message:]
$let[desc-enUS;Skipped]
$let[title-enUS;Skipped song]

$argsCheck[<1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}