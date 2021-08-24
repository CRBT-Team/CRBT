const { links, colors } = require("../../../index");

module.exports.command = {
    name: "info",
    module: "basic",
    aliases: ["crbti", "crbt", "bi", "botinfo", "bot-info", "bot_info", "crbt-info", "crbt_info", "stats", "crbtinfo"],
    description_enUS: "Gives detailed information and news about <botname>.",
    description_enUK: "Sends detailed information and the latest news of <botname>",
    description_frFR: "Présente des informations détaillées et actualités sur <botname>.",
    description_ru: "Даёт подробную информацию и новости о <botname>",
    slashCmd: 'crbt',
    code: `
$editMessage[$get[id];  
    {author:$get[title-$getGlobalUserVar[language]]:$userAvatar[$clientID;64]}

    {field:$get[members-$getGlobalUserVar[language]]:yes}

    {field:$get[servers-$getGlobalUserVar[language]]:yes}

    {field:$get[channels-$getGlobalUserVar[language]]:yes}

    {field:$get[creationDate-$getGlobalUserVar[language]]:no}

    {field:$get[ping-$getGlobalUserVar[language]]:no}

    {field:$get[uptime-$getGlobalUserVar[language]]:no}

    {thumbnail:$userAvatar[$clientID;512]}

    {color:$getGlobalUserVar[color]}
;$channelID]

$let[title-enUS;$username[$clientID] - Information]
$let[members-enUS;Members:$numberSeparator[$allMembersCount]]
$let[servers-enUS;Servers:$numberSeparator[$serverCount]]
$let[channels-enUS;Channels:$numberSeparator[$allChannelsCount]]
$let[creationDate-enUS;Created:<t:$formatDate[$creationDate[$clientID;date];X]> (<t:$formatDate[$creationDate[$clientID;date];X]:R>)]
$let[ping-enUS;Ping:≈$round[$math[($ping+$replaceText[$botPing;-;]+$dbPing)/3]] milliseconds (\`$getServerVar[prefix]ping\`)]
$let[uptime-enUS;Online since:<t:$get[up]> (<t:$get[up]:R>)]

$let[up;$round[$formatDate[$math[$dateStamp-$getObjectProperty[ms]];X]]]

$djsEval[const tools = require('dbd.js-utils')
let theUptimeInMS = tools.parseToMS("$replaceText[$uptime; ;]")
d.object.uptime = tools.parseMS(theUptimeInMS)
d.object.ms = theUptimeInMS]

$let[id;$splitText[1]]

$textSplit[$apiMessage[;
{title:Loading...}
{color:${colors.orange}}
;{actionRow:$get[web]:$get[invite]:$get[server]}
;$messageID:false;yes]; ]

$let[server;Discord,2,5,$replaceText[${links.info.discord};:;#COLON#]]
$let[invite;Invite,2,5,$replaceText[${links.invite};:;#COLON#]]
$let[web;Website,2,5,$replaceText[${links.baseURL};:;#COLON#]]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}