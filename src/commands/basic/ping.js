module.exports.command = {
    name: "ping",
    module: "basic",
    description_enUS: "Pings <botname> and then displays information relative to its connection.",
    description_enUK: "Pings <botname> and returns <botname>'s connection latency.",
    description_frFR: "Pingue <botname>, puis donne des informations sur son temps de réponse, la latence API, son temps d'activité, etc...",
    description_ru: "Пингует <botname> и показывает информацию о времени ответа, задержке API, времени безотказной работы и т. д.",
    code: `

$editMessage[$botLastMessageID;
{author:$get[title-$getGlobalUserVar[language]]:$userAvatar[$clientID;64]}

{field:$get[messageLatency-$getGlobalUserVar[language]]}
{field:$get[apiLatency-$getGlobalUserVar[language]]}
{field:$get[wsLatency-$getGlobalUserVar[language]]}
{field:$get[dbLatency-$getGlobalUserVar[language]]}
{field:$get[uptime-$getGlobalUserVar[language]]}

{color:$getGlobalUserVar[color]}
;$channelID]

$let[average;$round[$math[($botPing+$getObjectProperty[final]+$ping+$dbPing)/4]]]

$let[title-enUS;$username[$clientID] - Ping]
$let[messageLatency-enUS;Message latency: $round[$math[$ping/3]]ms]
$let[apiLatency-enUS;API latency: $getObjectProperty[final]ms]
$let[wsLatency-enUS;WebSocket latency: $replaceText[$botPing;-;]ms]
$let[dbLatency-enUS;Database latency: $dbPingms]
$let[uptime-enUS;Uptime: $getObjectProperty[uptime]]

$djsEval[
const tools = require('dbd.js-utils')
let theUptimeInMS = tools.parseToMS("$replaceText[$uptime; ;]")
d.object.uptime = tools.parseMS(theUptimeInMS)
]

$djsEval[let a = Date.now()
d.object.final = Math.floor(a - d.object.start - 50)
]

$wait[50ms]

$reply[$messageID;

{title:$get[progress-$getGlobalUserVar[language]]}
{color:$getGlobalUserVar[color]}

;no]

$let[progress-enUS;Pinging...]

$createObject[{"start": $dateStamp, "botPing": $botPing}]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}


/*

{thumbnail:$replaceText[$replaceText[$checkCondition[$get[average]<=400];true;${illustrations.ping.good}];false;$replaceText[$replaceText[$checkCondition[$get[average]<=600];true;${illustrations.ping.meh}];false;$replaceText[$checkCondition[$get[average]>600];true;${illustrations.ping.bad}]]]}





*/