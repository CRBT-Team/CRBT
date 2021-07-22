const {illustrations} = require("../../../index");

module.exports.command = {
    name: "queue",
    aliases: ["q", "songs", "playlist"],
    module: "music",
    description_enUS: "Retrieves 10 songs per page of the current music queue.",
    usage_enUS: "<queue page>",
    code: `
$if[$checkContains[$checkCondition[$message==]$checkCondition[$message==1];true]==true]

$reply[$messageID;
{author:Queue - Page 1 ($queueLength song$replaceText[$replaceText[$checkCondition[$queueLength==1];true;s];false;]):${illustrations.music.queue}}
{description:
$replaceText[**Now playing:**
[$songInfo[title]]($songInfo[url])
Uploaded by [$songInfo[publisher]]($songInfo[publisher_url]) | $replaceText[$songInfo[duration]; Seconds;s] | Added by <@!$songInfo[userID]>
—
$replaceText[$replaceText[$queue[1;11;{number}. [{title}](<{url}>)
Uploaded by [{publisher}]({publisher_url}) | {duration} | Added by <@!{userID}>
—]; Seconds;s] a;— a;]
$replaceText[$replaceText[$checkCondition[$queueLength>12];true;and $math[$queueLength-10] more... (\`$getServerVar[prefix]queue 2\`)];false;]
;—\n a;]
}
{color:$getGlobalUserVar[color]}
;no]

$else

$reply[$messageID;
{author:Queue - Page $message ($queueLength songs):${illustrations.music.queue}}
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
$onlyIf[$queueLength!=0;{execute:nomusic}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}

/*

$apiMessage[;

{actionRow:$get[prev]:$get[next]}
]

$let[next;,2,1,queue3,next|867080274194071582|false,false]

$let[prev;,2,1,queue2,previous|867080071637106699|false,true]

*/