module.exports.command = {
    name: "queue",
    aliases: ["q", "songs", "playlist"],
    module: "music",
    description_enUS: "Retrieves 10 songs per page of the current music queue.",
    usage_enUS: "<queue page>",
    code: `
$if[$message==]

$reply[$messageID;
{author:Queue - Page 1 ($queueLength songs):https://cdn.discordapp.com/attachments/843148633687588945/862975174839500800/list.png}
{description:
**Now playing:**
[$songInfo[title]]($songInfo[url])
Uploaded by [$songInfo[publisher]]($songInfo[publisher_url]) | $replaceText[$songInfo[duration]; Seconds;s] | Added by <@!$songInfo[userID]>
—
$replaceText[$replaceText[$queue[1;11;{number}. [{title}](<{url}>)
Uploaded by [{publisher}]({publisher_url}) | {duration} | Added by <@!{userID}>
—]; Seconds;s] a;— a;]
$replaceText[$replaceText[$checkCondition[$queueLength>12];true;and $math[$queueLength-10] more... (\`$getServerVar[prefix]queue 2\`)];false;]
}
{color:$getGlobalUserVar[color]}
;no]

$else

$reply[$messageID;
{author:Queue - Page $message ($queueLength songs):https://cdn.discordapp.com/attachments/843148633687588945/862975174839500800/list.png}
{description:
**Now playing:**
[$songInfo[title]]($songInfo[url])
Uploaded by [$songInfo[publisher]]($songInfo[publisher_url]) | $replaceText[$songInfo[duration]; Seconds;s] | Added by <@!$songInfo[userID]>
—
$replaceText[$replaceText[$queue[$message[1];11;{number}. [{title}](<{url}>)
Uploaded by [{publisher}]({publisher_url}) | {duration} | Added by <@!{userID}>
—]; Seconds;s] a;— a;]
}
{color:$getGlobalUserVar[color]}
;no]

$onlyIf[$math[$message*11]<$queueLength;{execute:queuePageMissing}]
$onlyIf[$isNumber[$message]==true;{execute:args}]

$endif

$argsCheck[<1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}