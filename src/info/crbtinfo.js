const { botinfo } = require("../../index");

module.exports.command = {
  name: "crbtinfo",
  module: "utility",
  aliases: ["crbti", "crbt", "bi", "botinfo", "bot-info", "bot_info", "crbt-info", "crbt_info", "stats", "info"],
  description_enUS: "Gives detailed information and news about <botname>.",
  description_enUK: "Sends detailed information and the latest news of <botname>",
  description_frFR: "Présente des informations détaillées et actualités sur <botname>.",
  description_ru: "Даёт подробную информацию и новости о <botname>",
  botperms: "",
  code: `
$reply[$messageID;  
  {author:$get[title-$getGlobalUserVar[language]]:$userAvatar[$clientID;64]}

  {description:
  $get[description-$getGlobalUserVar[language]]
  }

  {field:$get[members-$getGlobalUserVar[language]]:yes}

  {field:$get[servers-$getGlobalUserVar[language]]:yes}

  {field:$get[creationDate-$getGlobalUserVar[language]]:yes}

  {field:$get[ping-$getGlobalUserVar[language]]:yes}

  {field:$get[uptime-$getGlobalUserVar[language]]:yes}

  {field:$get[computer-$getGlobalUserVar[language]]:yes}

  {field:$get[news-$getGlobalUserVar[language]]:no}

  {thumbnail:https://clembs.xyz/media/placeholder-image.png}

  {color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;$userTag[$clientID] - Information]
$let[description-enUS;**[Website](https://clembs.xyz/crbt) | [Add to Discord](https://clembs.xyz/crbt/invite) | [Support server](https://clembs.xyz/crbt/server) | [Vote on top.gg](https://top.gg/bot/595731552709771264/vote)**
$replaceText[$replaceText[$checkCondition[$clientID==595731552709771264];false;Beta ${botinfo.build}];true;Stable ${botinfo.version}] | Created by [Clembs](https://clembs.xyz)]
$let[members-enUS;Members:$numberSeparator[$allMembersCount]]
$let[servers-enUS;Servers:$numberSeparator[$serverCount]]
$let[creationDate-enUS;Created at:$get[year]-$get[month]-$get[day] at $get[hour]:$get[minute]]
$let[ping-enUS;Ping: Server#COLON# $pingms\nAPI#COLON# $replaceText[$getObjectProperty[final];-;]ms\nDatabase#COLON# $dbPingms]
$let[uptime-enUS;Uptime: $getObjectProperty[uptime]]
$let[computer-enUS;Server: Disk speed#COLON# $roundTenth[$divide[$divide[$multi[$ram;8];$divide[$ping;1000]];1000];2] GB/s\nRAM#COLON# $ram MB\nCPU#COLON# $cpu%\nHosted by [Kiwatech](https://kiwatech.net/)]
$let[credits-enUS]
$let[news-enUS;Latest $username[$clientID] news: \`\`\`diff\n$replaceText[$replaceText[${botinfo.news};,;\n];();$getServerVar[prefix]]\n\`\`\`]

$let[title-enUK;$userTag[$clientID] - Bot Info]
$let[description-enUK;**[Website](https://clembs.xyz/crbt) | [Add to Server](https://clembs.xyz/crbt/invite) | [Support server](https://clembs.xyz/crbt/server) | [Vote on top.gg](https://top.gg/bot/595731552709771264/vote)**
$replaceText[$replaceText[$checkCondition[$clientID==595731552709771264];false;Beta ${botinfo.build}];true;Stable ${botinfo.version}] | Created by [Clembs](https://clembs.xyz)]
$let[members-enUK;Members:$numberSeparator[$allMembersCount]]
$let[servers-enUK;Servers:$numberSeparator[$serverCount]]
$let[creationDate-enUK;Created at: $get[day]/$get[month]/$get[year] at $get[hour]:$get[minute]]
$let[ping-enUK;Ping: Server#COLON# $pingms\nAPI#COLON# $replaceText[$getObjectProperty[final];-;]ms\nDatabase#COLON# $dbPingms]
$let[uptime-enUK;Uptime: $getObjectProperty[uptime]]
$let[computer-enUK;Server: Disk speed#COLON# $roundTenth[$divide[$divide[$multi[$ram;8];$divide[$ping;1000]];1000];2] GB/s\nRAM#COLON# $ram MB\nCPU#COLON# $cpu%\nHosted by [Kiwatech](https://kiwatech.net/)]
$let[news-enUK;$username[$clientID] ${botinfo.build} news: \`\`\`diff\n$replaceText[$replaceText[${botinfo.news};,;\n];();$getServerVar[prefix]]\n\`\`\`]

$let[title-frFR;$userTag[$clientID] - Informations]
$let[description-frFR;**[Site web](https://clembs.xyz/crbt) | [Ajouter sur Discord](https://clembs.xyz/crbt/invite) | [Serveur d'aide](https://clembs.xyz/crbt/server) | [Voter sur top.gg](https://top.gg/bot/595731552709771264/vote)**
$replaceText[$replaceText[$checkCondition[$clientID==595731552709771264];false;Beta ${botinfo.build}];true;Stable ${botinfo.version}] | Créé par [Clembs](https://clembs.xyz)]
$let[members-frFR;Members:$replaceText[$numberSeparator[$allMembersCount];,; ]]
$let[servers-frFR;Servers:$replaceText[$numberSeparator[$serverCount];,; ]]
$let[creationDate-frFR;Date de création: $get[day]/$get[month]/$get[year] à $get[hour]:$get[minute]]
$let[ping-frFR;Ping: Serveur #COLON# $pingms\nAPI #COLON# $replaceText[$getObjectProperty[final];-;]ms\nDatabase #COLON# $dbPingms]
$let[uptime-frFR;Uptime: $replaceText[$replaceText[$replaceText[$replaceText[$getObjectProperty[uptime];second;seconde];day;jour];, and; et];hour;heure]]
$let[computer-frFR;Serveur: Vitesse du disque #COLON# $roundTenth[$divide[$divide[$multi[$ram;8];$divide[$ping;1000]];1000];2] Go/s\nMémoire vive #COLON# $ram Mo\nProcesseur #COLON# $cpu%\nHébergé par [Kiwatech](https://kiwatech.net/)]
$let[news-frFR;Dernières nouveautés de $username[$clientID]: \`\`\`diff\n$replaceText[$replaceText[${botinfo.news};,;\n];();$getServerVar[prefix]]\n\`\`\`]

$let[title-ru;$userTag[$clientID] - информация]
$let[description-ru;**[Вебсайт](https://clembs.xyz/crbt) | [Добавить в Дискорд Сервер](https://clembs.xyz/crbt/invite) | [Поддержать сервер](https://clembs.xyz/crbt/server) | [Проголосовать на top.gg](https://top.gg/bot/595731552709771264/vote)**
$replaceText[$replaceText[$checkCondition[$clientID==595731552709771264];false;Beta ${botinfo.build}];true;Stable ${botinfo.version}] | Created by [Clembs](https://clembs.xyz)]
$let[members-ru;Участников:$replaceText[$numberSeparator[$allMembersCount];,; ]]
$let[servers-ru;Серверов:$replaceText[$numberSeparator[$serverCount];,; ]]
$let[creationDate-ru;Создан:$get[day].$get[month].$get[year] в $get[hour]:$get[minute]]
$let[ping-ru;Пинг: CRBT Сервер#COLON# $pingмс\nAPI#COLON# $replaceText[$getObjectProperty[final];-;]мс\nБаза Данных#COLON# $dbPingмс]
$let[uptime-ru;Время безотказной работы: $uptime]
$let[computer-ru;Сервер: Скорость ЖД#COLON# $roundTenth[$divide[$divide[$multi[$ram;8];$divide[$ping;1000]];1000];2] ГБ/с\nОЗУ#COLON# $ram MB\nМБ ЦП#COLON# $cpu%\nHosted by [Kiwatech](https://kiwatech.net/)]
$let[news-ru;Последние новости $username[$clientID]: \`\`\`diff\n$replaceText[$replaceText[${botinfo.news};,;\n];();$getServerVar[prefix]]\n\`\`\`]


$let[day;$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$creationDate[$clientID;date];DD]]==1];true;0$formatDate[$creationDate[$clientID;date];DD]];false;$formatDate[$creationDate[$clientID;date];DD]]]
$let[month;$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$creationDate[$clientID;date];MM]]==1];true;0$formatDate[$creationDate[$clientID;date];MM]];false;$formatDate[$creationDate[$clientID;date];MM]]]
$let[year;$formatDate[$creationDate[$clientID;date];YYYY]]
$let[hour;$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$creationDate[$clientID;date];HH]]==1];true;0$formatDate[$creationDate[$clientID;date];HH]];false;$formatDate[$creationDate[$clientID;date];HH]]]
$let[minute;$replaceText[$replaceText[$checkCondition[$charCount[$formatDate[$creationDate[$clientID;date];mm]]==1];true;0$formatDate[$creationDate[$clientID;date];mm]];false;$formatDate[$creationDate[$clientID;date];mm]]]

$djsEval[
let a = Date.now()
const ms = require('ms')
d.object.final = Math.floor(a - d.object.start)
d.object.owo = ms(a - d.object.start)
d.object.uwu = ms(d.object.botPing)

const tools = require('dbd.js-utils')
let theUptimeInMS = tools.parseToMS("$replaceText[$uptime; ;]")
d.object.uptime = tools.parseMS(theUptimeInMS)
]
$createObject[{"start": $dateStamp, "botPing": $botPing}]

$argsCheck[<2;{execute:args}]

$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
  `}