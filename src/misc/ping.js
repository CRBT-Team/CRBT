const { illustrations } = require("../../index")

module.exports.command = {
  name: "ping",
  module: "misc",
  description_enUS: "Pings <botname> and then displays information relative to its connection.",
  description_enUK: "Pings <botname> and returns <botname>'s connection latency.",
  description_frFR: "Pingue <botname>, puis donne des informations sur son temps de réponse, la latence API, son temps d'activité, etc...",
  description_ru: "Пингует <botname> и показывает информацию о времени ответа, задержке API, времени безотказной работы и т. д.",
  botperms: "",
  code: `

$editMessage[$botLastMessageID;
{author:$get[title-$getGlobalUserVar[language]]:$userAvatar[$clientID;64]}

{field:$get[serverLatency-$getGlobalUserVar[language]]}
{field:$get[apiLatency-$getGlobalUserVar[language]]}
{field:$get[dbLatency-$getGlobalUserVar[language]]}
{field:$get[uptime-$getGlobalUserVar[language]]}

{thumbnail:$replaceText[$replaceText[$checkCondition[$get[average]<=400];true;${illustrations.ping.good}];false;$replaceText[$replaceText[$checkCondition[$get[average]<=600];true;${illustrations.ping.meh}];false;$replaceText[$checkCondition[$get[average]>600];true;${illustrations.ping.bad}]]]}

{color:$getGlobalUserVar[color]}
;$channelID]

$let[title-enUS;$userTag[$clientID] - Ping]
$let[serverLatency-enUS;Server latency: \`\`\`
$pingms\`\`\`]
$let[apiLatency-enUS;API latency: \`\`\`
$getObjectProperty[final]ms\`\`\`]
$let[dbLatency-enUS;Database latency: \`\`\`
$dbPingms\`\`\`]
$let[uptime-enUS;Uptime: \`\`\`
$getObjectProperty[uptime]\`\`\`]

$let[title-enUK;$userTag[$clientID] - Ping]
$let[serverLatency-enUK;Server latency: \`\`\`
$pingms\`\`\`]
$let[apiLatency-enUK;API latency: \`\`\`
$getObjectProperty[final]ms\`\`\`]
$let[dbLatency-enUK;Database latency: \`\`\`
$dbPingms\`\`\`]
$let[uptime-enUK;Uptime: \`\`\`
$getObjectProperty[uptime]\`\`\`]

$let[title-frFR;$userTag[$clientID] - Ping]
$let[serverLatency-frFR;Latence du serveur : \`\`\`
$pingms\`\`\`]
$let[apiLatency-frFR;Latence de l'API : \`\`\`
$getObjectProperty[final]ms\`\`\`]
$let[dbLatency-frFR;Latence de la base de données : \`\`\`
$dbPingms\`\`\`]
$let[uptime-frFR;Temps d'activité : \`\`\`
$replaceText[$replaceText[$replaceText[$replaceText[$getObjectProperty[uptime];second;seconde];day;jour];, and; et];hour;heure]\`\`\`]

$let[title-ru;$userTag[$clientID] - Пинг]
$let[serverLatency-ru;Задержка сервера: \`\`\`
$pingмс\`\`\`]
$let[apiLatency-ru;Задержка API: \`\`\`
$getObjectProperty[final]мс\`\`\`]
$let[dbLatency-ru;Задержка базы данных: \`\`\`
$dbPingмс\`\`\`]
$let[uptime-ru;Время безотказной работы: \`\`\`
$uptime\`\`\`]

$let[average;$round[$math[$getObjectProperty[final]+$ping+$dbPing]]]

$djsEval[let a = Date.now()
const ms = require('ms')
d.object.final = Math.floor(a - d.object.start - 500)
d.object.owo = ms(a - d.object.start)
d.object.uwu = ms(d.object.botPing)]

$wait[500ms]

$reply[$messageID;

{title:$get[progress-$getGlobalUserVar[language]]}
{color:$getGlobalUserVar[color]}

;no]

$let[progress-enUS;Pinging...]

$let[progress-enUK;Pinging...]

$let[progress-frFR;Envoi du ping...]

$let[progress-ru;Пингуем...]

$djsEval[
const tools = require('dbd.js-utils')
let theUptimeInMS = tools.parseToMS("$replaceText[$uptime; ;]")
d.object.uptime = tools.parseMS(theUptimeInMS)
]
$createObject[{"start": $dateStamp, "botPing": $botPing}]

$argsCheck[0;{execute:args}]

$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
  `}